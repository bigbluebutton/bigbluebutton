package writer

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"

	"github.com/coder/websocket"
	"github.com/sirupsen/logrus"
	"golang.org/x/time/rate"
)

type testWriter struct {
	browser  *common.BrowserConnection
	hasura   *common.HasuraConnection
	received chan []byte
}

func startTestWriter(t *testing.T) *testWriter {
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

	ctx, cancel := context.WithCancel(context.Background())
	conn, _, err := websocket.Dial(ctx, "ws"+strings.TrimPrefix(server.URL, "http"), nil)
	if err != nil {
		server.Close()
		t.Fatalf("dial fake Hasura: %v", err)
	}

	browser := &common.BrowserConnection{
		Id:                             "BC1",
		CurrentlyInMeeting:             true,
		Context:                        context.Background(),
		ActiveSubscriptions:            map[string]common.GraphQlSubscription{},
		FromBrowserToHasuraChannel:     common.NewSafeChannelByte(10),
		FromBrowserToHasuraRateLimiter: rate.NewLimiter(rate.Inf, 1),
		FromHasuraToBrowserChannel:     common.NewSafeChannelByte(10),
		Logger:                         logrus.NewEntry(logrus.New()),
	}
	hasura := &common.HasuraConnection{
		Id:                "HC-new",
		BrowserConn:       browser,
		Websocket:         conn,
		Context:           ctx,
		ContextCancelFunc: cancel,
	}

	var wg sync.WaitGroup
	wg.Add(1)
	go HasuraConnectionWriter(hasura, &wg, []byte(`{"type":"connection_init"}`))
	t.Cleanup(func() {
		cancel()
		wg.Wait()
		conn.CloseNow()
		server.Close()
	})

	tw := &testWriter{browser: browser, hasura: hasura, received: received}
	tw.expectForwarded(t)
	return tw
}

func (w *testWriter) subscribe(id, operationName string) {
	message, _ := json.Marshal(map[string]interface{}{
		"id":   id,
		"type": "subscribe",
		"payload": map[string]interface{}{
			"operationName": operationName,
			"query":         "subscription " + operationName + " { user { userId } }",
		},
	})
	w.browser.FromBrowserToHasuraChannel.SendWait(context.Background(), message)
}

func (w *testWriter) expectForwarded(t *testing.T) []byte {
	t.Helper()
	select {
	case message := <-w.received:
		return message
	case <-time.After(time.Second):
		t.Fatal("message was not forwarded to Hasura")
	}
	return nil
}

func (w *testWriter) expectNotForwarded(t *testing.T) {
	t.Helper()
	select {
	case message := <-w.received:
		t.Fatalf("unexpected message forwarded to Hasura: %s", message)
	case <-time.After(100 * time.Millisecond):
	}
}

func (w *testWriter) expectBrowserError(t *testing.T, text string) {
	t.Helper()
	select {
	case message := <-w.browser.FromHasuraToBrowserChannel.ReceiveChannel():
		if !strings.Contains(string(message), text) {
			t.Fatalf("browser message %s does not contain %q", message, text)
		}
	case <-time.After(time.Second):
		t.Fatalf("browser did not receive error containing %q", text)
	}
}

func setSubscriptionLimit(t *testing.T, limit int) {
	t.Helper()
	saved := config.GetConfig().Server.MaxConnectionConcurrentSubscriptions
	config.GetConfig().Server.MaxConnectionConcurrentSubscriptions = limit
	t.Cleanup(func() { config.GetConfig().Server.MaxConnectionConcurrentSubscriptions = saved })
}

func TestResendingAnActiveSubscriptionAtTheLimit(t *testing.T) {
	setSubscriptionLimit(t, 1)
	w := startTestWriter(t)
	w.browser.ActiveSubscriptions["1"] = common.GraphQlSubscription{
		Id:                         "1",
		OperationName:              "getUsers",
		LastSeenOnHasuraConnection: "HC-old",
	}

	w.subscribe("1", "getUsers")
	w.expectForwarded(t)

	subscription := w.browser.ActiveSubscriptions["1"]
	if subscription.LastSeenOnHasuraConnection != w.hasura.Id {
		t.Errorf("Hasura connection id = %q, want %q", subscription.LastSeenOnHasuraConnection, w.hasura.Id)
	}
}

func TestNewSubscriptionAtTheLimitIsRejected(t *testing.T) {
	setSubscriptionLimit(t, 1)
	w := startTestWriter(t)
	w.browser.ActiveSubscriptions["1"] = common.GraphQlSubscription{Id: "1", OperationName: "getUsers"}

	w.subscribe("2", "getMeetings")
	w.expectBrowserError(t, "Limit exceeded")
	w.expectNotForwarded(t)
	if _, exists := w.browser.ActiveSubscriptions["2"]; exists {
		t.Error("rejected subscription was added to the active subscriptions")
	}
}

func TestNewSubscriptionBelowTheLimitIsForwarded(t *testing.T) {
	setSubscriptionLimit(t, 2)
	w := startTestWriter(t)
	w.browser.ActiveSubscriptions["1"] = common.GraphQlSubscription{Id: "1", OperationName: "getUsers"}

	w.subscribe("2", "getMeetings")
	w.expectForwarded(t)
	if _, exists := w.browser.ActiveSubscriptions["2"]; !exists {
		t.Error("forwarded subscription was not added to the active subscriptions")
	}
}
