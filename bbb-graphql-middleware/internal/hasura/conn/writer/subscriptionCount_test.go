package writer

import (
	"fmt"
	"testing"
)

// The writer keeps the connection's count of active subscriptions, and its peak, as it adds and
// removes them.
func TestTheWriterKeepsTheCountAndThePeak(t *testing.T) {
	w := startWriter(t, newBrowserConnection(true))
	for i := 1; i <= 3; i++ {
		w.send(subscribeOperation(fmt.Sprint(i), "getCounted"))
		w.expectSent(t)
	}
	w.send(completeMessage("1"))
	w.expectSent(t)

	if got := w.browser.ActiveSubscriptionsCount.Load(); got != 2 {
		t.Errorf("count = %d, want 2", got)
	}
	w.browser.ActiveSubscriptionsMutex.RLock()
	peak := w.browser.ActiveSubscriptionsPeak
	w.browser.ActiveSubscriptionsMutex.RUnlock()
	if peak != 3 {
		t.Errorf("peak = %d, want 3", peak)
	}
}
