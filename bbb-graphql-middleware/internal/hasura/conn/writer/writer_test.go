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
	"bbb-graphql-middleware/internal/hasura/retransmiter"

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
	w.send(id, "subscription "+operationName+" { user { userId } }", nil)
}

func (w *testWriter) send(id, query string, variables map[string]interface{}) {
	w.browser.FromBrowserToHasuraChannel.SendWait(context.Background(), subscribeMessage(id, query, variables))
}

// operationName is the name after the operation keyword, up to its variables or selection set.
func operationName(query string) string {
	fields := strings.Fields(query)
	if len(fields) < 2 {
		return ""
	}
	name := fields[1]
	if i := strings.IndexAny(name, "({"); i >= 0 {
		name = name[:i]
	}
	return name
}

// subscribeMessage is a browser subscribe, as the writer stores it and the retransmitter sends it again.
func subscribeMessage(id, query string, variables map[string]interface{}) []byte {
	payload := map[string]interface{}{"operationName": operationName(query), "query": query}
	if variables != nil {
		payload["variables"] = variables
	}
	message, _ := json.Marshal(map[string]interface{}{"id": id, "type": "subscribe", "payload": payload})
	return message
}

// setActive and active hold the lock, as the writer goroutine reads and writes the same map.
func (w *testWriter) setActive(subscription common.GraphQlSubscription) {
	w.browser.ActiveSubscriptionsMutex.Lock()
	defer w.browser.ActiveSubscriptionsMutex.Unlock()
	w.browser.ActiveSubscriptions[subscription.Id] = subscription
}

func (w *testWriter) active(id string) (common.GraphQlSubscription, bool) {
	w.browser.ActiveSubscriptionsMutex.RLock()
	defer w.browser.ActiveSubscriptionsMutex.RUnlock()
	subscription, exists := w.browser.ActiveSubscriptions[id]
	return subscription, exists
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

func (w *testWriter) expectNoBrowserMessage(t *testing.T) {
	t.Helper()
	select {
	case message := <-w.browser.FromHasuraToBrowserChannel.ReceiveChannel():
		t.Fatalf("unexpected message to the browser: %s", message)
	case <-time.After(100 * time.Millisecond):
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
	w.setActive(common.GraphQlSubscription{
		Id:                         "1",
		OperationName:              "getUsers",
		Type:                       common.Subscription,
		LastSeenOnHasuraConnection: "HC-old",
	})

	w.subscribe("1", "getUsers")
	w.expectForwarded(t)

	subscription, _ := w.active("1")
	if subscription.LastSeenOnHasuraConnection != w.hasura.Id {
		t.Errorf("Hasura connection id = %q, want %q", subscription.LastSeenOnHasuraConnection, w.hasura.Id)
	}
}

func TestNewSubscriptionAtTheLimitIsRejected(t *testing.T) {
	setSubscriptionLimit(t, 1)
	w := startTestWriter(t)
	w.setActive(common.GraphQlSubscription{Id: "1", OperationName: "getUsers", Type: common.Subscription})

	w.subscribe("2", "getMeetings")
	w.expectBrowserError(t, "Limit exceeded")
	w.expectNotForwarded(t)
	if _, exists := w.active("2"); exists {
		t.Error("rejected subscription was added to the active subscriptions")
	}
}

func TestNewSubscriptionBelowTheLimitIsForwarded(t *testing.T) {
	setSubscriptionLimit(t, 2)
	w := startTestWriter(t)
	w.setActive(common.GraphQlSubscription{Id: "1", OperationName: "getUsers", Type: common.Subscription})

	w.subscribe("2", "getMeetings")
	w.expectForwarded(t)
	if _, exists := w.active("2"); !exists {
		t.Error("forwarded subscription was not added to the active subscriptions")
	}
}

// The resends the retransmitter sends after a reconnection to Hasura are all forwarded at the limit,
// each one as it was stored.
func TestRetransmittedSubscriptionsAtTheLimitAreForwarded(t *testing.T) {
	setSubscriptionLimit(t, 2)
	w := startTestWriter(t)
	stored := map[string][]byte{}
	for _, id := range []string{"1", "2"} {
		stored[id] = subscribeMessage(id, "subscription getUsers"+id+" { user { userId } }", nil)
		w.setActive(common.GraphQlSubscription{
			Id:                         id,
			Message:                    stored[id],
			OperationName:              "getUsers" + id,
			Type:                       common.Subscription,
			LastSeenOnHasuraConnection: "HC-old",
		})
	}

	retransmiter.RetransmitSubscriptionStartMessages(w.hasura)
	forwarded := map[string]string{}
	for range stored {
		var message struct {
			ID string `json:"id"`
		}
		raw := w.expectForwarded(t)
		if err := json.Unmarshal(raw, &message); err != nil {
			t.Fatalf("forwarded message is not JSON: %s", raw)
		}
		forwarded[message.ID] = string(raw)
	}
	for id, message := range stored {
		if forwarded[id] != string(message) {
			t.Errorf("forwarded for id %s:\n%s\nwant the stored message:\n%s", id, forwarded[id], message)
		}
	}
	w.expectNoBrowserMessage(t)
}

// A resend carries over the last data the browser received, so an unchanged result is not sent again.
func TestResendKeepsTheLastReceivedData(t *testing.T) {
	setSubscriptionLimit(t, 1)
	w := startTestWriter(t)
	lastData := common.HasuraMessage{Type: "next", ID: "1"}
	w.setActive(common.GraphQlSubscription{
		Id:                         "1",
		OperationName:              "getUsers",
		Type:                       common.Subscription,
		LastSeenOnHasuraConnection: "HC-old",
		LastReceivedDataChecksum:   4242,
		LastReceivedData:           lastData,
	})

	w.subscribe("1", "getUsers")
	w.expectForwarded(t)

	subscription, _ := w.active("1")
	if subscription.LastReceivedDataChecksum != 4242 {
		t.Errorf("last received data checksum = %d, want 4242", subscription.LastReceivedDataChecksum)
	}
	if subscription.LastReceivedData.Type != lastData.Type || subscription.LastReceivedData.ID != lastData.ID {
		t.Errorf("last received data = %+v, want %+v", subscription.LastReceivedData, lastData)
	}
}

// A stream resent by the retransmitter at the limit goes to Hasura from the cursor it had reached, not
// from the initial value of the query, and keeps that cursor in its entry.
func TestResendOfAStreamKeepsTheCursor(t *testing.T) {
	setSubscriptionLimit(t, 1)
	w := startTestWriter(t)
	w.setActive(common.GraphQlSubscription{
		Id: "1",
		Message: subscribeMessage("1",
			"subscription getMessages($createdAt: timestamptz) { message_stream(batch_size: 10, cursor: {initial_value: {createdAt: $createdAt}}) { createdAt } }",
			map[string]interface{}{"createdAt": "2020-01-01T00:00:00Z"}),
		OperationName:              "getMessages",
		Type:                       common.Streaming,
		LastSeenOnHasuraConnection: "HC-old",
		StreamCursorField:          "createdAt",
		StreamCursorVariableName:   "createdAt",
		StreamCursorCurrValue:      "2026-11-20T00:00:00Z",
	})

	retransmiter.RetransmitSubscriptionStartMessages(w.hasura)
	var forwarded common.BrowserSubscribeMessage
	if err := json.Unmarshal(w.expectForwarded(t), &forwarded); err != nil {
		t.Fatalf("forwarded message is not JSON: %v", err)
	}
	if forwarded.ID != "1" || forwarded.Payload.OperationName != "getMessages" {
		t.Errorf("forwarded id and operation = %q, %q, want 1, getMessages", forwarded.ID, forwarded.Payload.OperationName)
	}
	if got := forwarded.Payload.Variables["createdAt"]; got != "2026-11-20T00:00:00Z" {
		t.Errorf("cursor sent to Hasura = %v, want the reached value 2026-11-20T00:00:00Z", got)
	}

	subscription, _ := w.active("1")
	if subscription.StreamCursorField != "createdAt" || subscription.StreamCursorVariableName != "createdAt" {
		t.Errorf("cursor field and variable = %q, %q, want createdAt, createdAt",
			subscription.StreamCursorField, subscription.StreamCursorVariableName)
	}
	if subscription.StreamCursorCurrValue != "2026-11-20T00:00:00Z" {
		t.Errorf("cursor value = %v, want the reached value 2026-11-20T00:00:00Z", subscription.StreamCursorCurrValue)
	}
}

// A subscription that reuses the id of a query still running is not a resend: at the limit it is rejected.
func TestSubscriptionReusingTheIdOfARunningQueryAtTheLimitIsRejected(t *testing.T) {
	for _, lastSeen := range []string{"HC-new", "HC-old"} {
		t.Run("query last sent on "+lastSeen, func(t *testing.T) {
			setSubscriptionLimit(t, 1)
			w := startTestWriter(t)
			w.setActive(common.GraphQlSubscription{
				Id:                         "1",
				OperationName:              "getUsers",
				Type:                       common.Query,
				LastSeenOnHasuraConnection: lastSeen,
			})

			w.subscribe("1", "getUsers")
			w.expectBrowserError(t, "Limit exceeded")
			w.expectNotForwarded(t)
			if subscription, _ := w.active("1"); subscription.Type != common.Query {
				t.Errorf("entry type = %q, want it to stay %q", subscription.Type, common.Query)
			}
		})
	}
}

// A second subscribe with the id of a subscription already sent on this Hasura connection is not a
// resend: at the limit it is rejected, as before.
func TestDuplicateOfASubscriptionOnThisHasuraConnectionAtTheLimitIsRejected(t *testing.T) {
	setSubscriptionLimit(t, 1)
	w := startTestWriter(t)
	w.setActive(common.GraphQlSubscription{
		Id:                         "1",
		OperationName:              "getUsers",
		Type:                       common.Subscription,
		LastSeenOnHasuraConnection: w.hasura.Id,
	})

	w.subscribe("1", "getUsers")
	w.expectBrowserError(t, "Limit exceeded")
	w.expectNotForwarded(t)
}

// An aggregate subscription is a subscription: its resend is forwarded at the limit.
func TestResendingAnAggregateAtTheLimit(t *testing.T) {
	setSubscriptionLimit(t, 1)
	w := startTestWriter(t)
	w.setActive(common.GraphQlSubscription{
		Id:                         "1",
		OperationName:              "getUsersCount",
		Type:                       common.SubscriptionAggregate,
		LastSeenOnHasuraConnection: "HC-old",
	})

	w.send("1", "subscription getUsersCount { user_aggregate { aggregate { count } } }", nil)
	w.expectForwarded(t)
	w.expectNoBrowserMessage(t)
}

// A limit of 0 turns the limit off: no subscription is refused, whatever the count.
func TestNoLimitWhenTheLimitIsZero(t *testing.T) {
	setSubscriptionLimit(t, 0)
	w := startTestWriter(t)
	for _, id := range []string{"1", "2", "3"} {
		w.setActive(common.GraphQlSubscription{Id: id, OperationName: "getUsers", Type: common.Subscription})
	}

	w.subscribe("4", "getMeetings")
	w.expectForwarded(t)
	w.expectNoBrowserMessage(t)
}

// Queries share the map with the subscriptions, so the count can be above the limit; a resend is
// still forwarded then.
func TestResendWhileTheCountIsAboveTheLimit(t *testing.T) {
	setSubscriptionLimit(t, 2)
	w := startTestWriter(t)
	w.setActive(common.GraphQlSubscription{Id: "1", OperationName: "getUsers", Type: common.Subscription, LastSeenOnHasuraConnection: "HC-old"})
	w.setActive(common.GraphQlSubscription{Id: "2", OperationName: "getMeetings", Type: common.Subscription, LastSeenOnHasuraConnection: "HC-old"})
	w.setActive(common.GraphQlSubscription{Id: "3", OperationName: "getChat", Type: common.Query, LastSeenOnHasuraConnection: w.hasura.Id})

	w.subscribe("1", "getUsers")
	w.expectForwarded(t)
	w.expectNoBrowserMessage(t)
}

// A second subscribe with the id of a stream already sent on this Hasura connection is not a resend:
// at the limit it is rejected.
func TestDuplicateOfAStreamOnThisHasuraConnectionAtTheLimitIsRejected(t *testing.T) {
	setSubscriptionLimit(t, 1)
	w := startTestWriter(t)
	w.setActive(common.GraphQlSubscription{
		Id:                         "1",
		OperationName:              "getMessages",
		Type:                       common.Streaming,
		LastSeenOnHasuraConnection: w.hasura.Id,
	})

	w.send("1",
		"subscription getMessages($createdAt: timestamptz) { message_stream(batch_size: 10, cursor: {initial_value: {createdAt: $createdAt}}) { createdAt } }",
		map[string]interface{}{"createdAt": "2020-01-01T00:00:00Z"})
	w.expectBrowserError(t, "Limit exceeded")
	w.expectNotForwarded(t)
}

// A subscription that reuses the id of an old mutation is not a resend: at the limit it is rejected.
func TestSubscriptionReusingTheIdOfAMutationAtTheLimitIsRejected(t *testing.T) {
	setSubscriptionLimit(t, 1)
	w := startTestWriter(t)
	w.setActive(common.GraphQlSubscription{
		Id:                         "1",
		OperationName:              "setUserName",
		Type:                       common.Mutation,
		LastSeenOnHasuraConnection: "HC-old",
	})

	w.subscribe("1", "getUsers")
	w.expectBrowserError(t, "Limit exceeded")
	w.expectNotForwarded(t)
}
