package writer

import (
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"
)

func completeMessage(id string) string {
	message, _ := json.Marshal(map[string]interface{}{"id": id, "type": "complete"})
	return string(message)
}

// A complete from the browser removes the subscription and counts it, once.
func TestACompleteFromTheBrowserIsCountedOnce(t *testing.T) {
	w := startWriter(t, newBrowserConnection(true))
	removed := func() float64 {
		return metricstest.Value(common.GqlSubscriptionRemovedCounter.WithLabelValues(string(common.Subscription), "getTimer", common.RemovedByClient))
	}
	before := removed()

	w.send(subscribeOperation("1", "getTimer"))
	w.expectSent(t)
	w.send(completeMessage("1"))
	w.expectSent(t) // the complete, forwarded to Hasura
	w.send(completeMessage("1"))
	w.expectSent(t)

	if got := removed(); got != before+1 {
		t.Errorf("gql_subscription_removed_total{reason=client_complete}: %v -> %v, want +1", before, got)
	}
	if _, active := w.subscription("1"); active {
		t.Error("the completed subscription is still active")
	}
}

// A subscribe handled after the browser connection closed: the connection's subscriptions were
// removed and counted when it closed, and this one is neither added nor counted as started, so the
// subscriptions started never outnumber those removed.
func TestASubscribeAfterTheConnectionClosedIsNotStarted(t *testing.T) {
	w := startWriter(t, newBrowserConnection(true))
	started := func() float64 {
		return metricstest.Value(common.GqlSubscribeCounter.WithLabelValues(string(common.Subscription), "getLateUsers"))
	}
	before := started()

	common.RecordConnectionSubscriptionsRemoved(w.browser) // the browser connection closes
	w.send(subscribeOperation("1", "getLateUsers"))
	w.send(completeMessage("2")) // forwarded once the writer is past the subscribe
	var forwarded struct {
		Type string `json:"type"`
	}
	json.Unmarshal(w.expectSent(t), &forwarded)
	if forwarded.Type != "complete" {
		t.Errorf("the subscribe on the closed connection was forwarded to Hasura")
	}

	if _, active := w.subscription("1"); active {
		t.Error("the subscribe was added to the closed connection")
	}
	if got := started(); got != before {
		t.Errorf("gql_subscription_total counted the subscribe on the closed connection: %v -> %v", before, got)
	}
}

// A complete from the browser is counted once the connection's lock is released: a scrape that
// waits on that lock does not hold the writer up.
func TestACompleteFromTheBrowserIsCountedOutsideTheConnectionLock(t *testing.T) {
	w := startWriter(t, newBrowserConnection(true))
	metricstest.ScrapeWhileLocked(t, &w.browser.ActiveSubscriptionsMutex, 2000, func(run int) {
		id := fmt.Sprint(run)
		w.browser.ActiveSubscriptionsMutex.Lock()
		// A new label each time, so each removal creates its series.
		w.browser.ActiveSubscriptions[id] = common.GraphQlSubscription{Id: id, Type: common.Subscription, OperationNameLabel: "browserCompleteLock" + id}
		w.browser.ActiveSubscriptionsMutex.Unlock()
		w.send(completeMessage(id))
		select { // the complete, forwarded once handled; the test fails on a stall, not here
		case <-w.received:
		case <-time.After(10 * time.Second):
		}
	}, common.GqlSubscriptionRemovedCounter)
}
