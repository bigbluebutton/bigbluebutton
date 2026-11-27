//go:build !race

// These tests drive an accepted connection through ConnectionHandler. They are left out of a run
// with the race detector, which reports a data race on the connection's Logger that predates the
// metrics: HasuraClient replaces it on every connection to Hasura (hasura/client.go:38) while the
// GraphQL actions client logs with it (gql_actions/client.go:25).

package websrv

import (
	"context"
	"encoding/json"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"github.com/coder/websocket"
)

// serveOn serves handler on the address of the repository's config.yml that the middleware calls.
func serveOn(t *testing.T, address string, handler http.Handler) {
	t.Helper()
	listener, err := net.Listen("tcp", address)
	if err != nil {
		t.Fatalf("listen on %s: %v", address, err)
	}
	server := &http.Server{Handler: handler}
	go server.Serve(listener)
	t.Cleanup(func() { server.Close() })
}

// fakeServices serves a bbb-web and an akka-apps that accept every session, and a Hasura that
// acknowledges each connection, answers each subscribe with one data message, and drops the first
// dropFirst connections right after acknowledging them.
func fakeServices(t *testing.T, dropFirst int32) {
	t.Helper()
	serveOn(t, "127.0.0.1:8090", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"response":"authorized","X-MeetingId":"m1","X-UserId":"u1"}`))
	}))
	serveOn(t, "127.0.0.1:8901", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"response":"authorized","X-Hasura-Role":"bbb_client","X-Hasura-UserId":"u1","X-Hasura-MeetingId":"m1"}`))
	}))
	var connections atomic.Int32
	serveOn(t, "127.0.0.1:8185", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{Subprotocols: []string{"graphql-transport-ws"}})
		if err != nil {
			return
		}
		defer conn.CloseNow()
		drop := connections.Add(1) <= dropFirst
		for {
			_, data, err := conn.Read(r.Context())
			if err != nil {
				return
			}
			var message struct {
				Type string `json:"type"`
				ID   string `json:"id"`
			}
			json.Unmarshal(data, &message)
			switch message.Type {
			case "connection_init":
				conn.Write(r.Context(), websocket.MessageText, []byte(`{"type":"connection_ack"}`))
				if drop {
					return
				}
			case "subscribe":
				reply, _ := json.Marshal(map[string]interface{}{"type": "next", "id": message.ID,
					"payload": map[string]interface{}{"data": map[string]interface{}{"user": []map[string]string{{"userId": message.ID}}}}})
				conn.Write(r.Context(), websocket.MessageText, reply)
			}
		}
	}))
}

// acceptedBrowser is a browser whose connection ConnectionHandler accepted.
type acceptedBrowser struct {
	conn    *websocket.Conn
	ctx     context.Context
	handled chan struct{}
}

func connectAcceptedBrowser(t *testing.T) *acceptedBrowser {
	t.Helper()
	handled := make(chan struct{})
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer close(handled)
		ConnectionHandler(w, r)
	}))
	t.Cleanup(server.Close)
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	t.Cleanup(cancel)
	conn, _, err := websocket.Dial(ctx, "ws"+strings.TrimPrefix(server.URL, "http"),
		&websocket.DialOptions{Subprotocols: []string{"graphql-transport-ws"}})
	if err != nil {
		t.Fatalf("connect to the middleware: %v", err)
	}
	b := &acceptedBrowser{conn: conn, ctx: ctx, handled: handled}
	b.send(t, map[string]interface{}{"type": "connection_init", "payload": map[string]interface{}{"headers": map[string]string{
		"X-Session-Token": "accepted-token", "X-ClientSessionUUID": "accepted-uuid", "X-ClientType": "HTML5", "X-ClientIsMobile": "false",
	}}})
	b.waitFor(t, "connection_ack")
	return b
}

func (b *acceptedBrowser) send(t *testing.T, message map[string]interface{}) {
	t.Helper()
	data, _ := json.Marshal(message)
	if err := b.conn.Write(b.ctx, websocket.MessageText, data); err != nil {
		t.Fatalf("send to the middleware: %v", err)
	}
}

func (b *acceptedBrowser) subscribe(t *testing.T, id, operationName string) {
	t.Helper()
	b.send(t, map[string]interface{}{"id": id, "type": "subscribe", "payload": map[string]interface{}{
		"operationName": operationName, "query": "subscription " + operationName + " { user { userId } }",
	}})
}

// waitFor reads the messages from the middleware until one of the type.
func (b *acceptedBrowser) waitFor(t *testing.T, messageType string) {
	t.Helper()
	for {
		_, data, err := b.conn.Read(b.ctx)
		if err != nil {
			t.Fatalf("waiting for %q: %v", messageType, err)
		}
		var message struct {
			Type string `json:"type"`
		}
		json.Unmarshal(data, &message)
		if message.Type == messageType {
			return
		}
	}
}

// close closes the browser side and waits for ConnectionHandler to return.
func (b *acceptedBrowser) close(t *testing.T) {
	t.Helper()
	b.conn.Close(websocket.StatusNormalClosure, "")
	select {
	case <-b.handled:
	case <-time.After(15 * time.Second):
		t.Fatal("the connection handler did not return")
	}
}

func openConnectionsForMetrics() int {
	open := 0
	openConnectionSubscriptions.Range(func(_, _ any) bool { open++; return true })
	return open
}

// An accepted connection with one subscription that receives data, then closes: counted as
// accepted, its subscription as started, served and removed on close, its peak observed, and
// counted in the highest number of subscriptions while it is open, and no longer once closed.
func TestAnAcceptedConnectionThroughTheHandler(t *testing.T) {
	fakeServices(t, 0)
	const operationName = "acceptedGetUsers"
	subscription := string(common.Subscription)
	accepted := func() float64 { return metricstest.Value(common.WsConnectionAcceptedCounter) }
	started := func() float64 {
		return metricstest.Value(common.GqlSubscribeCounter.WithLabelValues(subscription, operationName))
	}
	closed := func() float64 {
		return metricstest.Value(common.GqlSubscriptionRemovedCounter.WithLabelValues(subscription, operationName, common.RemovedOnConnectionClose))
	}
	received := func() float64 {
		return metricstest.Value(common.GqlReceivedDataCounter.WithLabelValues(subscription, operationName))
	}
	firstData := func() float64 {
		common.RegisterMetrics()
		return metricstest.MustRead(t, `gql_subscription_first_data_duration_seconds{type="`+subscription+`"} count`)
	}
	peaks := func() float64 { return metricstest.Value(common.WsConnectionSubscriptionsPeak) }
	peakSum := func() float64 { return metricstest.Sum(common.WsConnectionSubscriptionsPeak) }
	a, s, c, r, f, p, ps := accepted(), started(), closed(), received(), firstData(), peaks(), peakSum()

	browser := connectAcceptedBrowser(t)
	browser.subscribe(t, "1", operationName)
	browser.waitFor(t, "next")
	if got := maxActiveSubscriptions(); got != 1 {
		t.Errorf("ws_connection_subscriptions_max while connected: %v, want 1", got)
	}
	browser.close(t)

	for _, c := range []struct {
		name          string
		before, after float64
	}{
		{"ws_connection_accepted", a, accepted()},
		{"gql_subscription_total", s, started()},
		{"gql_subscription_removed_total{reason=connection_closed}", c, closed()},
		{"gql_received_data_total", r, received()},
		{"gql_subscription_first_data_duration_seconds observations", f, firstData()},
		{"ws_connection_subscriptions_peak observations", p, peaks()},
		{"ws_connection_subscriptions_peak sum", ps, peakSum()},
	} {
		if c.after != c.before+1 {
			t.Errorf("%s: %v -> %v, want +1", c.name, c.before, c.after)
		}
	}
	if got := openConnectionsForMetrics(); got != 0 {
		t.Errorf("%d connections still read by ws_connection_subscriptions_max after the close", got)
	}
}

// Hasura drops the first connection of an accepted browser connection: the middleware connects
// again, and counts that reconnection, once.
func TestAReconnectionToHasuraThroughTheHandler(t *testing.T) {
	fakeServices(t, 1)
	reconnections := func() float64 {
		common.RegisterMetrics()
		return metricstest.MustRead(t, `gql_hasura_reconnection_total{reason="`+common.ReconnectionHasuraReadError+`"}`)
	}
	before := reconnections()

	browser := connectAcceptedBrowser(t)
	browser.subscribe(t, "1", "reconnectedGetUsers") // sent once the middleware is connected again
	browser.waitFor(t, "next")
	browser.close(t)

	if got := reconnections(); got != before+1 {
		t.Errorf("gql_hasura_reconnection_total{reason=hasura_read_error}: %v -> %v, want +1", before, got)
	}
}
