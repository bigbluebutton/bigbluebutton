package writer

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"

	"github.com/coder/websocket"
)

// writerUntilItEnds runs the writer of a connection to a fake Hasura that reads until the test
// closes the connection, and returns the connection to Hasura and a wait for the writer to end.
func writerUntilItEnds(t *testing.T, beforeInit func(*websocket.Conn)) (*common.HasuraConnection, *runningWriter, func()) {
	t.Helper()
	received := make(chan []byte, 10)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := websocket.Accept(w, r, nil)
		if err != nil {
			return
		}
		defer conn.CloseNow()
		for {
			_, message, err := conn.Read(r.Context())
			if err != nil {
				return
			}
			received <- message
		}
	}))
	t.Cleanup(server.Close)
	ctx, cancel := context.WithCancel(context.Background())
	t.Cleanup(cancel)
	conn, _, err := websocket.Dial(ctx, "ws"+strings.TrimPrefix(server.URL, "http"), nil)
	if err != nil {
		t.Fatalf("dial the fake Hasura: %v", err)
	}
	// The writer can end without closing the socket, and server.Close does not close a hijacked
	// connection: close it, so the fake Hasura does not stay blocked in Read after the test.
	t.Cleanup(func() { conn.CloseNow() })
	beforeInit(conn)
	browser := newBrowserConnection(true)
	hasura := &common.HasuraConnection{Id: "HC1", BrowserConn: browser, Websocket: conn, Context: ctx, ContextCancelFunc: cancel}
	var wg sync.WaitGroup
	wg.Add(1)
	go HasuraConnectionWriter(hasura, &wg, []byte(`{"type":"connection_init"}`))
	ended := func() {
		t.Helper()
		done := make(chan struct{})
		go func() { wg.Wait(); close(done) }()
		select {
		case <-done:
		case <-time.After(5 * time.Second):
			t.Fatal("the writer did not end")
		}
	}
	return hasura, &runningWriter{browser: browser, hasura: hasura, received: received}, ended
}

func TestTheWriterRecordsWhyTheConnectionToHasuraEnds(t *testing.T) {
	t.Run("the init cannot be written", func(t *testing.T) {
		hasura, _, ended := writerUntilItEnds(t, func(conn *websocket.Conn) { conn.CloseNow() })
		ended()
		if got := hasura.CloseReason(); got != common.ReconnectionHasuraWriteError {
			t.Errorf("close reason %q, want %q", got, common.ReconnectionHasuraWriteError)
		}
	})
	t.Run("a browser message is not JSON", func(t *testing.T) {
		hasura, w, ended := writerUntilItEnds(t, func(*websocket.Conn) {})
		w.expectSent(t) // the init
		w.send("not json")
		ended()
		if got := hasura.CloseReason(); got != common.ReconnectionInvalidBrowserMessage {
			t.Errorf("close reason %q, want %q", got, common.ReconnectionInvalidBrowserMessage)
		}
	})
	t.Run("a message cannot be forwarded", func(t *testing.T) {
		hasura, w, ended := writerUntilItEnds(t, func(*websocket.Conn) {})
		w.expectSent(t) // the init
		hasura.Websocket.CloseNow()
		w.send(subscribeOperation("1", "getUsers"))
		ended()
		if got := hasura.CloseReason(); got != common.ReconnectionHasuraWriteError {
			t.Errorf("close reason %q, want %q", got, common.ReconnectionHasuraWriteError)
		}
	})
}
