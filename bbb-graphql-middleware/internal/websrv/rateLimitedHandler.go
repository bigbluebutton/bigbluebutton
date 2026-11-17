package websrv

import (
	"context"
	"errors"
	"net/http"
	"time"

	"bbb-graphql-middleware/internal/common"

	"golang.org/x/time/rate"
)

// RateLimitedConnectionHandler serves a connection once the server's connection rate limiter lets
// it through, and answers 429 when the limiter cannot serve it within 120 s.
func RateLimitedConnectionHandler(rateLimiter *rate.Limiter, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 120*time.Second)
		defer cancel()

		common.HttpConnectionGauge.Inc()
		common.HttpConnectionCounter.Inc()
		defer common.HttpConnectionGauge.Dec()

		if err := common.WaitForRateLimiter(ctx, rateLimiter, common.HttpConnectionRateLimitWait, common.HttpConnectionRateLimitExceededCounter); err != nil {
			if !errors.Is(err, context.Canceled) {
				http.Error(w, "Request cancelled or rate limit exceeded", http.StatusTooManyRequests)
			}

			return
		}

		next(w, r)
	}
}
