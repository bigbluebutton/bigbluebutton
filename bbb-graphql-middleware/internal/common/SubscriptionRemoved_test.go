package common

import (
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
