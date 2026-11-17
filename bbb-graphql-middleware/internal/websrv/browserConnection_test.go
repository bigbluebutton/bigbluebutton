package websrv

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/coder/websocket"
)

// testBrowser is a browser connected to ConnectionHandler. It is used for connections that end
// before or at their init: an accepted connection runs the connection's goroutines, which the race
// detector reports on as they share the connection's Logger.
type testBrowser struct {
	conn    *websocket.Conn
	handled chan struct{} // closed when ConnectionHandler returns
}

// connectBrowser opens a browser connection to ConnectionHandler, without sending anything.
func connectBrowser(t *testing.T) *testBrowser {
	t.Helper()
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
	b := &testBrowser{conn: conn, handled: handled}
	// Read what the middleware sends, so a close it starts completes its handshake.
	go func() {
		for {
			if _, _, err := conn.Read(context.Background()); err != nil {
				return
			}
		}
	}()
	t.Cleanup(func() { b.close(t) })
	return b
}

func (b *testBrowser) init(t *testing.T, headers map[string]string) {
	t.Helper()
	b.send(t, map[string]interface{}{"type": "connection_init", "payload": map[string]interface{}{"headers": headers}})
}

func (b *testBrowser) send(t *testing.T, message map[string]interface{}) {
	t.Helper()
	data, _ := json.Marshal(message)
	if err := b.conn.Write(context.Background(), websocket.MessageText, data); err != nil {
		t.Fatalf("send to the middleware: %v", err)
	}
}

// close closes the browser side and waits for ConnectionHandler to return.
func (b *testBrowser) close(t *testing.T) {
	t.Helper()
	b.conn.Close(websocket.StatusNormalClosure, "")
	b.waitHandled(t)
}

// waitHandled waits for ConnectionHandler to return, the connection closed by either side.
func (b *testBrowser) waitHandled(t *testing.T) {
	t.Helper()
	select {
	case <-b.handled:
	case <-time.After(10 * time.Second):
		t.Fatal("the connection handler did not return")
	}
}
