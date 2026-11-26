package websrv

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"slices"
	"strings"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"

	"github.com/coder/websocket"
)

// A connection rejected at init ends there: the handler returns after closing it, without going
// on to register the connection as a user connection.
func TestRejectedConnectionInitEndsTheHandler(t *testing.T) {
	done := make(chan struct{})
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ConnectionHandler(w, r)
		close(done)
	}))
	defer server.Close()

	// Held for the test: a handler that goes on to register the connection waits here.
	common.UserConnectionsCountMutex.Lock()
	locked := true
	defer func() {
		if locked {
			common.UserConnectionsCountMutex.Unlock()
		}
	}()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	conn, _, err := websocket.Dial(ctx, "ws"+strings.TrimPrefix(server.URL, "http"), &websocket.DialOptions{Subprotocols: []string{"graphql-transport-ws"}})
	if err != nil {
		t.Fatalf("dial: %v", err)
	}
	defer conn.CloseNow()
	// Read until the server closes, as a browser does, so the close handshake completes, and keep
	// what it sent.
	received := make(chan []byte, 10)
	go func() {
		defer close(received)
		for {
			_, message, err := conn.Read(ctx)
			if err != nil {
				return
			}
			received <- message
		}
	}()
	// No X-Session-Token: the init is rejected.
	if err := conn.Write(ctx, websocket.MessageText, []byte(`{"type":"connection_init","payload":{"headers":{}}}`)); err != nil {
		t.Fatalf("write connection_init: %v", err)
	}

	select {
	case <-done:
	case <-time.After(2 * time.Second):
		common.UserConnectionsCountMutex.Unlock()
		locked = false
		<-done
		t.Fatal("the handler went on after rejecting the connection init")
	}

	// The connection was rejected at its init, for the missing header, and not before it (by the
	// limit of server connections, for instance), which would end the handler without the init.
	var rejection struct {
		Payload []struct {
			MessageId string `json:"messageId"`
		} `json:"payload"`
	}
	var messageIds []string
	for message := range received {
		if json.Unmarshal(message, &rejection) == nil {
			for _, item := range rejection.Payload {
				messageIds = append(messageIds, item.MessageId)
			}
		}
	}
	if !slices.Contains(messageIds, "param_missing") {
		t.Errorf("the connection was not rejected at its init for param_missing; rejection ids: %v", messageIds)
	}
}
