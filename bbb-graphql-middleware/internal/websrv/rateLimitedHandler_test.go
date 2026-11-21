package websrv

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"golang.org/x/time/rate"
)

// A connection waits for the server's connection rate limiter: a served wait is observed, and a
// wait the limiter cannot serve within the deadline is counted as exceeded and answered with 429.
func TestTheConnectionRateLimiterObservesTheWaitAndCountsTheExceeded(t *testing.T) {
	limiter := rate.NewLimiter(rate.Every(time.Hour), 1) // one token, the next in an hour
	served := 0
	handler := RateLimitedConnectionHandler(limiter, func(w http.ResponseWriter, r *http.Request) { served++ })
	waits := func() float64 { return metricstest.Value(common.HttpConnectionRateLimitWait) }
	exceeded := func() float64 { return metricstest.Value(common.HttpConnectionRateLimitExceededCounter) }
	waitsBefore, exceededBefore := waits(), exceeded()

	var codes []int
	for i := 0; i < 2; i++ {
		response := httptest.NewRecorder()
		handler(response, httptest.NewRequest(http.MethodGet, "/graphql", nil))
		codes = append(codes, response.Code)
	}

	if served != 1 || codes[1] != http.StatusTooManyRequests {
		t.Errorf("served %d connections with codes %v, want 1 served and the second answered 429", served, codes)
	}
	if got := waits(); got != waitsBefore+1 {
		t.Errorf("waits: %v -> %v, want +1", waitsBefore, got)
	}
	if got := exceeded(); got != exceededBefore+1 {
		t.Errorf("exceeded: %v -> %v, want +1", exceededBefore, got)
	}
}
