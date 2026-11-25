package websrv

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"github.com/coder/websocket"
)

// rejectedConnections reads ws_connection_rejected for a reason from the registry, which must
// export it before any rejection (the series of a closed set exist from the start).
func rejectedConnections(t *testing.T, reason string) float64 {
	t.Helper()
	common.RegisterMetrics()
	RegisterConnectionMetrics()
	return metricstest.MustRead(t, `ws_connection_rejected{reason="`+reason+`"}`)
}

// A connection rejected at init: counted as rejected with its reason, not as accepted, and left out
// of the peak.
func TestRejectedConnectionMetrics(t *testing.T) {
	accepted, rejected, peaks := metricstest.Value(common.WsConnectionAcceptedCounter), rejectedConnections(t, "param_missing"), metricstest.Value(common.WsConnectionSubscriptionsPeak)

	browser := connectBrowser(t)
	browser.init(t, map[string]string{"X-ClientSessionUUID": "uuid-no-token"}) // no X-Session-Token
	browser.waitHandled(t)

	if got := rejectedConnections(t, "param_missing"); got != rejected+1 {
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
	closedBeforeInit, paramMissing := rejectedConnections(t, "closed_before_init"), rejectedConnections(t, "param_missing")

	browser := connectBrowser(t)
	browser.close(t)

	if got := rejectedConnections(t, "closed_before_init"); got != closedBeforeInit+1 {
		t.Errorf("ws_connection_rejected{reason=closed_before_init}: %v -> %v, want +1", closedBeforeInit, got)
	}
	if got := rejectedConnections(t, "param_missing"); got != paramMissing {
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
	rejected := rejectedConnections(t, "connections_limit_exceeded")

	connectBrowser(t).waitHandled(t)

	if got := rejectedConnections(t, "connections_limit_exceeded"); got != rejected+1 {
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
	before, err := metricstest.Series()
	if err != nil {
		t.Fatalf("gather: %v", err)
	}
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

	after, err := metricstest.Series()
	if err != nil {
		t.Fatalf("gather: %v", err)
	}
	want := map[string]float64{
		`ws_connection_rejected{reason="init_timeout"}`: 1,
	}
	changed := metricstest.Changed(before, after)
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
	if got := rejectedConnections(t, "other"); got != before[`ws_connection_rejected{reason="other"}`] {
		t.Errorf("counted as other: %v", got)
	}
}
