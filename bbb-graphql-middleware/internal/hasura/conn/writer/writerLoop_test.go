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

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"github.com/coder/websocket"
	"github.com/sirupsen/logrus"
	"golang.org/x/time/rate"
)

// runningWriter is a HasuraConnectionWriter connected to a fake Hasura that records the messages
// it receives.
type runningWriter struct {
	browser  *common.BrowserConnection
	hasura   *common.HasuraConnection
	received chan []byte
	stop     func()
}

func newBrowserConnection(inMeeting bool) *common.BrowserConnection {
	return &common.BrowserConnection{
		Id:                             "BC1",
		CurrentlyInMeeting:             inMeeting,
		Context:                        context.Background(),
		ActiveSubscriptions:            map[string]common.GraphQlSubscription{},
		FromBrowserToHasuraChannel:     common.NewSafeChannelByte(100),
		FromBrowserToHasuraRateLimiter: rate.NewLimiter(rate.Inf, 1),
		FromHasuraToBrowserChannel:     common.NewSafeChannelByte(100),
		Logger:                         logrus.NewEntry(logrus.New()),
	}
}

func startWriter(t *testing.T, browser *common.BrowserConnection) *runningWriter {
	t.Helper()
	return startWriterOn(t, browser, "HC1")
}

// startWriterOn starts the writer of the connection to Hasura with the given id: a reconnection
// is a writer started with another id for the same browser connection.
func startWriterOn(t *testing.T, browser *common.BrowserConnection, hasuraConnectionId string) *runningWriter {
	t.Helper()
	received := make(chan []byte, 100)
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
		t.Fatalf("dial the fake Hasura: %v", err)
	}
	hasura := &common.HasuraConnection{Id: hasuraConnectionId, BrowserConn: browser, Websocket: conn, Context: ctx, ContextCancelFunc: cancel}
	var wg sync.WaitGroup
	wg.Add(1)
	go HasuraConnectionWriter(hasura, &wg, []byte(`{"type":"connection_init"}`))
	var stopOnce sync.Once
	stop := func() {
		stopOnce.Do(func() {
			cancel()
			stopped := make(chan struct{})
			go func() { wg.Wait(); close(stopped) }()
			select {
			case <-stopped:
			case <-time.After(5 * time.Second):
				t.Error("the writer did not stop")
			}
			conn.CloseNow()
			server.Close()
		})
	}
	t.Cleanup(stop)
	w := &runningWriter{browser: browser, hasura: hasura, received: received, stop: stop}
	w.expectSent(t) // the connection_init
	return w
}

// send hands a message to the writer, as the browser reader does.
func (w *runningWriter) send(message string) {
	w.browser.FromBrowserToHasuraChannel.SendWait(context.Background(), []byte(message))
}

func (w *runningWriter) expectSent(t *testing.T) []byte {
	t.Helper()
	select {
	case message := <-w.received:
		return message
	case <-time.After(5 * time.Second):
		t.Fatal("the writer sent nothing to Hasura")
	}
	return nil
}

// waitUntil waits for the writer to have handled a message, seen through the connection's state.
func (w *runningWriter) waitUntil(t *testing.T, done func() bool) {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for !done() {
		if time.Now().After(deadline) {
			t.Fatal("the writer did not handle the message")
		}
		time.Sleep(5 * time.Millisecond)
	}
}

func (w *runningWriter) subscription(id string) (common.GraphQlSubscription, bool) {
	w.browser.ActiveSubscriptionsMutex.RLock()
	defer w.browser.ActiveSubscriptionsMutex.RUnlock()
	subscription, ok := w.browser.ActiveSubscriptions[id]
	return subscription, ok
}

func subscribeOperation(id, operationName string) string {
	message, _ := json.Marshal(map[string]interface{}{
		"id":   id,
		"type": "subscribe",
		"payload": map[string]interface{}{
			"operationName": operationName,
			"query":         "subscription " + operationName + " { user { userId } }",
		},
	})
	return string(message)
}

func queryMessage(id, operationName string) string {
	message, _ := json.Marshal(map[string]interface{}{
		"id":   id,
		"type": "subscribe",
		"payload": map[string]interface{}{
			"operationName": operationName,
			"query":         "query " + operationName + " { user { userId } }",
		},
	})
	return string(message)
}

// A query still in flight when the connection to Hasura is replaced is sent again with its id, as
// the retransmitter does: it is counted as started once.
func TestAResentQueryIsCountedAsStartedOnce(t *testing.T) {
	w := startWriter(t, newBrowserConnection(true))
	started := func() float64 {
		return metricstest.Value(common.GqlSubscribeCounter.WithLabelValues(string(common.Query), "getQueryData"))
	}
	before := started()

	w.send(queryMessage("q1", "getQueryData"))
	w.expectSent(t)
	w.send(queryMessage("q1", "getQueryData")) // the resend after a reconnection to Hasura
	w.expectSent(t)

	if got := started(); got != before+1 {
		t.Errorf("gql_subscription_total{type=\"query\"}: %v -> %v, want +1", before, got)
	}
}

// A subscription started counts under the capped label of its operationName, never under the
// name the client sent when that name is not admitted.
func TestAStartIsCountedUnderTheCappedLabel(t *testing.T) {
	w := startWriter(t, newBrowserConnection(true))
	started := func(label string) float64 {
		return metricstest.Value(common.GqlSubscribeCounter.WithLabelValues(string(common.Subscription), label))
	}
	other := started(common.OtherOperationLabel)

	w.send(subscribeOperation("1", "get started"))
	w.expectSent(t)

	if got := started(common.OtherOperationLabel); got != other+1 {
		t.Errorf("gql_subscription_total{operationName=%q}: %v -> %v, want +1", common.OtherOperationLabel, other, got)
	}
	if got := started("get started"); got != 0 {
		t.Errorf("the name outside the GraphQL grammar became a label: %v", got)
	}
}
