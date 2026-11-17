package common

import (
	"context"
	"errors"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"golang.org/x/time/rate"
)

// WaitForRateLimiter waits for a token of the limiter, observing how long it waited, or counts
// the wait as exceeded when the limiter cannot serve it before the context's deadline. A wait
// whose context is cancelled (the connection ended while it waited) is not counted, and a wait
// that fails is never observed.
func WaitForRateLimiter(ctx context.Context, limiter *rate.Limiter, wait prometheus.Observer, exceeded prometheus.Counter) error {
	start := time.Now()
	if err := limiter.Wait(ctx); err != nil {
		if !errors.Is(err, context.Canceled) {
			exceeded.Inc()
		}
		return err
	}
	wait.Observe(time.Since(start).Seconds())
	return nil
}
