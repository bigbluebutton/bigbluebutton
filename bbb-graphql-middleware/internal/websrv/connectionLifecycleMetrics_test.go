package websrv

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"github.com/coder/websocket"
	"github.com/prometheus/client_golang/prometheus"
)

func rejectedConnections(reason string) float64 {
	return metricstest.Value(common.WsConnectionRejectedCounter.WithLabelValues(reason))
}

// A connection rejected at init: counted as rejected with its reason, not as accepted, and left out
// of the peak.
func TestRejectedConnectionMetrics(t *testing.T) {
	accepted, rejected, peaks := metricstest.Value(common.WsConnectionAcceptedCounter), rejectedConnections("param_missing"), metricstest.Value(common.WsConnectionSubscriptionsPeak)

	browser := connectBrowser(t)
	browser.init(t, map[string]string{"X-ClientSessionUUID": "uuid-no-token"}) // no X-Session-Token
	browser.waitHandled(t)

	if got := rejectedConnections("param_missing"); got != rejected+1 {
		t.Errorf("ws_connection_rejected{reason=param_missing}: %v -> %v, want +1", rejected, got)
	}
	if got := metricstest.Value(common.WsConnectionAcceptedCounter); got != accepted {
		t.Errorf("the rejected connection was counted as accepted: %v -> %v", accepted, got)
	}
	if got := metricstest.Value(common.WsConnectionSubscriptionsPeak); got != peaks {
		t.Errorf("the rejected connection was observed in the peak: %v -> %v", peaks, got)
	}
}

// A browser that leaves before it sends its connection_init has its own reason.
func TestConnectionClosedBeforeInitMetrics(t *testing.T) {
	closedBeforeInit, paramMissing := rejectedConnections("closed_before_init"), rejectedConnections("param_missing")

	browser := connectBrowser(t)
	browser.close(t)

	if got := rejectedConnections("closed_before_init"); got != closedBeforeInit+1 {
		t.Errorf("ws_connection_rejected{reason=closed_before_init}: %v -> %v, want +1", closedBeforeInit, got)
	}
	if got := rejectedConnections("param_missing"); got != paramMissing {
		t.Errorf("counted as param_missing: %v -> %v", paramMissing, got)
	}
}

// A connection over the server's connection limit is rejected before its init.
func TestConnectionOverTheServerLimitMetrics(t *testing.T) {
	common.UserConnectionsCountMutex.Lock()
	saved := common.GlobalConnectionsCount
	common.GlobalConnectionsCount = common.GetMaxConnectionsGlobal()
	common.UserConnectionsCountMutex.Unlock()
	t.Cleanup(func() {
		common.UserConnectionsCountMutex.Lock()
		common.GlobalConnectionsCount = saved
		common.UserConnectionsCountMutex.Unlock()
	})
	rejected := rejectedConnections("connections_limit_exceeded")

	connectBrowser(t).waitHandled(t)

	if got := rejectedConnections("connections_limit_exceeded"); got != rejected+1 {
		t.Errorf("ws_connection_rejected{reason=connections_limit_exceeded}: %v -> %v, want +1", rejected, got)
	}
}

// A browser that sends no connection_init before the init timeout is closed with 4408 and counted
// as rejected with its own reason. The handler goes on after the close (its context cancelled), and
// nothing it does in that stretch moves another series of the middleware: the whole registry is
// compared before and after.
func TestConnectionInitTimeoutMetrics(t *testing.T) {
	common.RegisterMetrics()
	RegisterConnectionMetrics()
	saved := connectionInitTimeout
	connectionInitTimeout = 100 * time.Millisecond
	t.Cleanup(func() { connectionInitTimeout = saved })
	before := gatherSeries(t)
	if _, ok := before[`ws_connection_rejected{reason="init_timeout"}`]; !ok {
		t.Fatal(`ws_connection_rejected{reason="init_timeout"} is not exported before the timeout`)
	}

	handled := make(chan struct{})
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer close(handled)
		ConnectionHandler(w, r)
	}))
	t.Cleanup(server.Close)
	conn, _, err := websocket.Dial(context.Background(), "ws"+strings.TrimPrefix(server.URL, "http"),
		&websocket.DialOptions{Subprotocols: []string{"graphql-transport-ws"}})
	if err != nil {
		t.Fatalf("connect to the middleware: %v", err)
	}
	defer conn.CloseNow()

	// The read returns when the middleware closes the connection.
	_, _, err = conn.Read(context.Background())
	if code := websocket.CloseStatus(err); code != 4408 {
		t.Fatalf("closed with %v (%v), want 4408", code, err)
	}
	select {
	case <-handled:
	case <-time.After(10 * time.Second):
		t.Fatal("the connection handler did not return")
	}
	// A margin before the registry is read, in case something the handler started is still running:
	// the Hasura and gql-actions clients it starts see the cancelled context and end at once.
	time.Sleep(300 * time.Millisecond)

	after := gatherSeries(t)
	want := map[string]float64{
		`ws_connection_rejected{reason="init_timeout"}`: 1,
	}
	changed := map[string]float64{}
	for key, value := range after {
		if delta := value - before[key]; delta != 0 {
			changed[key] = delta
		}
	}
	for key := range before {
		if _, ok := after[key]; !ok {
			changed[key] = -before[key]
		}
	}
	for key, delta := range changed {
		if want[key] != delta {
			t.Errorf("%s moved by %v during a connection that only timed out", key, delta)
		}
	}
	for key, delta := range want {
		if changed[key] != delta {
			t.Errorf("%s: moved by %v, want %v", key, changed[key], delta)
		}
	}
	if got := rejectedConnections("other"); got != before[`ws_connection_rejected{reason="other"}`] {
		t.Errorf("counted as other: %v", got)
	}
}

// gatherSeries reads every series of the default registry except the Go runtime and process ones:
// a counter or gauge by its value, a histogram by its count and its sum.
func gatherSeries(t *testing.T) map[string]float64 {
	t.Helper()
	families, err := prometheus.DefaultGatherer.Gather()
	if err != nil {
		t.Fatalf("gather: %v", err)
	}
	series := map[string]float64{}
	for _, family := range families {
		name := family.GetName()
		if strings.HasPrefix(name, "go_") || strings.HasPrefix(name, "process_") || strings.HasPrefix(name, "promhttp_") {
			continue
		}
		for _, metric := range family.GetMetric() {
			labels := make([]string, 0, len(metric.GetLabel()))
			for _, label := range metric.GetLabel() {
				labels = append(labels, fmt.Sprintf("%s=%q", label.GetName(), label.GetValue()))
			}
			key := name
			if len(labels) > 0 {
				key += "{" + strings.Join(labels, ",") + "}"
			}
			switch {
			case metric.GetCounter() != nil:
				series[key] = metric.GetCounter().GetValue()
			case metric.GetGauge() != nil:
				series[key] = metric.GetGauge().GetValue()
			case metric.GetHistogram() != nil:
				series[key+" count"] = float64(metric.GetHistogram().GetSampleCount())
				series[key+" sum"] = metric.GetHistogram().GetSampleSum()
			}
		}
	}
	return series
}
