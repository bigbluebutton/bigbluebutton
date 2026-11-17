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

// Each request to the connection handler is counted, and counted as active while it is served.
func TestTheConnectionHandlerCountsTheHTTPConnections(t *testing.T) {
	active := func() float64 { return metricstest.Value(common.HttpConnectionGauge) }
	total := func() float64 { return metricstest.Value(common.HttpConnectionCounter) }
	activeBefore, totalBefore := active(), total()
	activeWhileServed := 0.0
	handler := RateLimitedConnectionHandler(rate.NewLimiter(rate.Inf, 1), func(w http.ResponseWriter, r *http.Request) {
		activeWhileServed = active()
	})

	handler(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/graphql", nil))

	if activeWhileServed != activeBefore+1 {
		t.Errorf("http_connection_active while served: %v, want %v", activeWhileServed, activeBefore+1)
	}
	if got := active(); got != activeBefore {
		t.Errorf("http_connection_active after: %v, want %v", got, activeBefore)
	}
	if got := total(); got != totalBefore+1 {
		t.Errorf("http_connection_total: %v -> %v, want +1", totalBefore, got)
	}
}
