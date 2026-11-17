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
	"bbb-graphql-middleware/internal/hasura/retransmiter"
	"bbb-graphql-middleware/internal/metricstest"

	"github.com/coder/websocket"
	"github.com/prometheus/client_golang/prometheus"
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

func TestFirstDataClockStartsWhenTheSubscriptionIsSent(t *testing.T) {
	w := startWriter(t, newBrowserConnection(false))

	// Outside the meeting the subscription is kept but not sent.
	w.send(subscribeOperation("1", "getUsers"))
	w.waitUntil(t, func() bool { _, ok := w.subscription("1"); return ok })

	// Back in the meeting, the retransmission after the reconnection sends it.
	w.browser.Lock()
	w.browser.CurrentlyInMeeting = true
	w.browser.Unlock()
	beforeSend := time.Now()
	w.send(subscribeOperation("1", "getUsers"))
	w.expectSent(t)

	subscription, _ := w.subscription("1")
	if subscription.FirstDataPendingSince.IsZero() {
		t.Fatal("no first data wait was started when the subscription was sent")
	}
	if subscription.FirstDataPendingSince.Before(beforeSend) {
		t.Errorf("the first data wait started at %v, before the subscription was sent at %v", subscription.FirstDataPendingSince, beforeSend)
	}
}

func TestTheSubscriptionKeepsItsResolvedLabel(t *testing.T) {
	w := startWriter(t, newBrowserConnection(true))
	w.send(subscribeOperation("1", "getUsers"))
	w.send(subscribeOperation("2", "get users"))
	w.expectSent(t)
	w.expectSent(t)

	for id, want := range map[string]string{"1": "getUsers", "2": common.OtherOperationLabel} {
		if subscription, _ := w.subscription(id); subscription.OperationNameLabel != want {
			t.Errorf("subscription %s: label %q, want %q", id, subscription.OperationNameLabel, want)
		}
	}
}

// A connection at the subscription limit that reconnects to Hasura: its subscriptions are resent
// and forwarded, and counted as retransmitted only; they are neither rejected by the limit, nor
// new subscriptions, nor removals. A new subscription at the limit is still rejected and counted.
func TestRetransmissionAtTheLimitIsForwardedAndCountedAsRetransmitted(t *testing.T) {
	setSubscriptionLimit(t, 2)
	w := startWriter(t, newBrowserConnection(true))
	const operationName = "getAtTheLimit"
	label := func(vec *prometheus.CounterVec, extra ...string) float64 {
		return metricstest.Value(vec.WithLabelValues(append([]string{string(common.Subscription), operationName}, extra...)...))
	}
	removed := func() float64 {
		total := 0.0
		for _, reason := range []string{common.RemovedByClient, common.RemovedByHasura, common.RemovedOnConnectionClose} {
			total += label(common.GqlSubscriptionRemovedCounter, reason)
		}
		return total
	}

	started := label(common.GqlSubscribeCounter)
	w.send(subscribeOperation("1", operationName))
	w.send(subscribeOperation("2", operationName))
	w.expectSent(t)
	w.expectSent(t)
	if got := label(common.GqlSubscribeCounter); got != started+2 {
		t.Fatalf("gql_subscription_total: %v -> %v, want +2", started, got)
	}

	retransmitted, rejected, removedBefore := label(common.GqlSubscriptionRetransmittedCounter), label(common.GqlSubscriptionLimitRejectedCounter), removed()
	// The connection to Hasura is replaced: the new one has another id, so the retransmitter
	// resends both, and its writer forwards them.
	w.stop()
	w = startWriterOn(t, w.browser, "HC2")
	retransmiter.RetransmitSubscriptionStartMessages(w.hasura)
	w.expectSent(t)
	w.expectSent(t)

	if got := label(common.GqlSubscriptionRetransmittedCounter); got != retransmitted+2 {
		t.Errorf("gql_subscription_retransmitted_total: %v -> %v, want +2", retransmitted, got)
	}
	if got := label(common.GqlSubscriptionLimitRejectedCounter); got != rejected {
		t.Errorf("gql_subscription_limit_rejected_total counted the retransmission: %v -> %v", rejected, got)
	}
	if got := label(common.GqlSubscribeCounter); got != started+2 {
		t.Errorf("gql_subscription_total counted the retransmission: %v, want %v", got, started+2)
	}
	if got := removed(); got != removedBefore {
		t.Errorf("gql_subscription_removed_total counted the retransmission: %v -> %v", removedBefore, got)
	}

	// A new subscription at the limit.
	w.send(subscribeOperation("3", operationName))
	w.waitUntil(t, func() bool { return label(common.GqlSubscriptionLimitRejectedCounter) == rejected+1 })
	if _, ok := w.subscription("3"); ok {
		t.Error("the new subscription over the limit was registered")
	}
	if got := label(common.GqlSubscribeCounter); got != started+2 {
		t.Errorf("gql_subscription_total counted the rejected subscription: %v, want %v", got, started+2)
	}
}

// The wait restarts on every forward to Hasura until the first data arrives: a subscription sent
// inside the meeting, with no data yet, whose user leaves and comes back, waits from the last
// resend, not from the first send.
func TestFirstDataClockRestartsOnEveryForward(t *testing.T) {
	w := startWriter(t, newBrowserConnection(true))
	setInMeeting := func(inMeeting bool) {
		w.browser.Lock()
		w.browser.CurrentlyInMeeting = inMeeting
		w.browser.Unlock()
	}

	w.send(subscribeOperation("1", "getUsers"))
	w.expectSent(t)

	// The user leaves: the retransmission after the reconnection keeps the subscription but does
	// not send it, so no wait runs while the user is out.
	setInMeeting(false)
	w.send(subscribeOperation("1", "getUsers"))
	w.waitUntil(t, func() bool {
		subscription, _ := w.subscription("1")
		return subscription.FirstDataPendingSince.IsZero()
	})

	// Back in the meeting, the next retransmission sends it again.
	setInMeeting(true)
	beforeResend := time.Now()
	w.send(subscribeOperation("1", "getUsers"))
	w.expectSent(t)

	subscription, _ := w.subscription("1")
	if subscription.FirstDataPendingSince.IsZero() || subscription.FirstDataPendingSince.Before(beforeResend) {
		t.Errorf("the first data wait started at %v, want from the resend at %v", subscription.FirstDataPendingSince, beforeResend)
	}
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

// A subscription whose first data already arrived keeps it settled when it is resent after a
// reconnection: its first data is not waited for, nor observed, again.
func TestAResentSubscriptionKeepsItsFirstDataSettled(t *testing.T) {
	w := startWriterOn(t, newBrowserConnection(true), "HC2")
	w.browser.ActiveSubscriptionsMutex.Lock()
	w.browser.ActiveSubscriptions["1"] = common.GraphQlSubscription{
		Id: "1", Type: common.Subscription, OperationName: "getUsers", LastSeenOnHasuraConnection: "HC1", FirstDataReceived: true,
	}
	w.browser.ActiveSubscriptionsMutex.Unlock()

	w.send(subscribeOperation("1", "getUsers"))
	w.expectSent(t)

	subscription, _ := w.subscription("1")
	if !subscription.FirstDataReceived || !subscription.FirstDataPendingSince.IsZero() {
		t.Errorf("the resend waits for the first data again: received %v, pending since %v", subscription.FirstDataReceived, subscription.FirstDataPendingSince)
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
