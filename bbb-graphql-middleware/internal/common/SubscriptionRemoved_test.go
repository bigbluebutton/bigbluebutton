package common

import (
	"fmt"
	"testing"

	"bbb-graphql-middleware/internal/metricstest"
)

func TestRecordSubscriptionRemoved(t *testing.T) {
	removed := func(reason string) float64 {
		return metricstest.Value(GqlSubscriptionRemovedCounter.WithLabelValues(string(Streaming), "getChat", reason))
	}
	subscription := GraphQlSubscription{Id: "1", OperationName: "getChat", Type: Streaming}
	for _, reason := range []string{RemovedByClient, RemovedByHasura, RemovedOnConnectionClose} {
		before := removed(reason)
		RecordSubscriptionRemoved(subscription, reason)
		if got := removed(reason); got != before+1 {
			t.Errorf("reason %q: %v -> %v, want +1", reason, before, got)
		}
	}
}

func TestRecordConnectionSubscriptionsRemoved(t *testing.T) {
	removed := func() float64 {
		return metricstest.Value(GqlSubscriptionRemovedCounter.WithLabelValues(string(Subscription), "getUsers", RemovedOnConnectionClose))
	}
	browser := &BrowserConnection{ActiveSubscriptions: map[string]GraphQlSubscription{
		"1": {Id: "1", OperationName: "getUsers", Type: Subscription},
		"2": {Id: "2", OperationName: "getUsers", Type: Subscription},
	}}
	before := removed()
	RecordConnectionSubscriptionsRemoved(browser)
	if got := removed(); got != before+2 {
		t.Errorf("connection_closed: %v -> %v, want +2", before, got)
	}
	if len(browser.ActiveSubscriptions) != 0 {
		t.Errorf("%d subscriptions left after the connection closed", len(browser.ActiveSubscriptions))
	}
}

// The subscriptions removed when a connection closes are counted once its lock is released: a
// scrape that waits on that lock does not hold the close up.
func TestRemovalsOnCloseAreCountedOutsideTheConnectionLock(t *testing.T) {
	browser := &BrowserConnection{ActiveSubscriptions: map[string]GraphQlSubscription{}}
	metricstest.ScrapeWhileLocked(t, &browser.ActiveSubscriptionsMutex, 200, func(run int) {
		browser.ActiveSubscriptionsMutex.Lock()
		browser.ActiveSubscriptionsClosed = false
		for i := 0; i < 20; i++ {
			id := fmt.Sprint(i)
			// A new label each time, so each removal creates its series.
			browser.ActiveSubscriptions[id] = GraphQlSubscription{Id: id, Type: Subscription, OperationNameLabel: fmt.Sprintf("closeLock%d_%d", run, i)}
		}
		browser.ActiveSubscriptionsMutex.Unlock()
		RecordConnectionSubscriptionsRemoved(browser)
	}, GqlSubscriptionRemovedCounter)
}

// A removal counts under the capped label of the subscription's operationName, never under the
// name the client sent when that name is not admitted.
func TestRemovalsAreCountedUnderTheCappedLabel(t *testing.T) {
	removed := func(label string) float64 {
		return metricstest.Value(GqlSubscriptionRemovedCounter.WithLabelValues(string(Subscription), label, RemovedByClient))
	}
	other := removed(OtherOperationLabel)
	RecordSubscriptionRemoved(GraphQlSubscription{Id: "1", Type: Subscription, OperationName: "get removed", OperationNameLabel: MetricOperationName("get removed")}, RemovedByClient)
	if got := removed(OtherOperationLabel); got != other+1 {
		t.Errorf("gql_subscription_removed_total{operationName=%q}: %v -> %v, want +1", OtherOperationLabel, other, got)
	}
	if got := removed("get removed"); got != 0 {
		t.Errorf("the name outside the GraphQL grammar became a label: %v", got)
	}
}
