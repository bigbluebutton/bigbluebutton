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

// initTimeoutReason is the reason ws_connection_rejected counts a connection_init timeout under.
const initTimeoutReason = "connection_init not received in time"

// A browser that sends no connection_init before the init timeout is closed with 4408, and the
// handler goes on after the close; the connection is counted as rejected, and not as accepted.
func TestAConnectionInitTimeoutIsCountedAsRejectedOnly(t *testing.T) {
	saved := connectionInitTimeout
	connectionInitTimeout = 100 * time.Millisecond
	t.Cleanup(func() { connectionInitTimeout = saved })
	accepted := metricstest.Value(common.WsConnectionAcceptedCounter)
	rejected := metricstest.Value(common.WsConnectionRejectedCounter.WithLabelValues(initTimeoutReason))

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
	if _, _, err = conn.Read(context.Background()); websocket.CloseStatus(err) != 4408 {
		t.Fatalf("closed with %v, want 4408", err)
	}
	select {
	case <-handled:
	case <-time.After(10 * time.Second):
		t.Fatal("the connection handler did not return")
	}

	if got := metricstest.Value(common.WsConnectionRejectedCounter.WithLabelValues(initTimeoutReason)); got != rejected+1 {
		t.Errorf("ws_connection_rejected{reason=%q}: %v -> %v, want +1", initTimeoutReason, rejected, got)
	}
	if got := metricstest.Value(common.WsConnectionAcceptedCounter); got != accepted {
		t.Errorf("the timed-out connection was counted as accepted: %v -> %v", accepted, got)
	}
}
