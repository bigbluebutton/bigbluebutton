package common

import (
	"fmt"
	"testing"

	"bbb-graphql-middleware/internal/metricstest"
)

func TestNoteActiveSubscriptionsKeepsThePeak(t *testing.T) {
	browser := &BrowserConnection{ActiveSubscriptions: map[string]GraphQlSubscription{}}
	for i := 0; i < 3; i++ {
		id := fmt.Sprintf("%d", i)
		browser.ActiveSubscriptions[id] = GraphQlSubscription{Id: id}
		browser.NoteActiveSubscriptionsLocked()
	}
	delete(browser.ActiveSubscriptions, "0")
	browser.NoteActiveSubscriptionsLocked()

	if browser.ActiveSubscriptionsPeak != 3 {
		t.Fatalf("peak = %d, want 3", browser.ActiveSubscriptionsPeak)
	}

	count, sum := metricstest.Value(WsConnectionSubscriptionsPeak), metricstest.Sum(WsConnectionSubscriptionsPeak)
	RecordConnectionSubscriptionsPeak(browser)
	if got := metricstest.Value(WsConnectionSubscriptionsPeak) - count; got != 1 {
		t.Errorf("observations = %v, want 1", got)
	}
	if got := metricstest.Sum(WsConnectionSubscriptionsPeak) - sum; got != 3 {
		t.Errorf("observed %v, want 3", got)
	}
}
