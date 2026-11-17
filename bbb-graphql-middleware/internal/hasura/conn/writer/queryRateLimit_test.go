package writer

import (
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"golang.org/x/time/rate"
)

// A subscribe message waits for the connection's query rate limiter: a served wait is observed,
// and a wait the limiter cannot serve within the deadline is counted as exceeded and the message is
// rejected.
func TestTheQueryRateLimiterObservesTheWaitAndCountsTheExceeded(t *testing.T) {
	browser := newBrowserConnection(true)
	browser.FromBrowserToHasuraRateLimiter = rate.NewLimiter(rate.Every(time.Hour), 1) // one token, the next in an hour
	w := startWriter(t, browser)
	waits := func() float64 { return metricstest.Value(common.GqlQueryRateLimitWait) }
	exceeded := func() float64 { return metricstest.Value(common.GqlQueryRateLimitExceededCounter) }
	waitsBefore, exceededBefore := waits(), exceeded()

	w.send(subscribeOperation("1", "getUsers"))
	w.expectSent(t)
	w.send(subscribeOperation("2", "getUsers"))
	w.waitUntil(t, func() bool { return exceeded() == exceededBefore+1 })

	if got := waits(); got != waitsBefore+1 {
		t.Errorf("waits: %v -> %v, want +1", waitsBefore, got)
	}
	if _, ok := w.subscription("2"); ok {
		t.Error("the subscription over the limit was registered")
	}
}
