package common

import (
	"context"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/metricstest"

	"github.com/prometheus/client_golang/prometheus"
	"golang.org/x/time/rate"
)

func histogramOf(h prometheus.Histogram) (count uint64, sum float64) {
	return uint64(metricstest.Value(h)), metricstest.Sum(h)
}

func counterOf(c prometheus.Counter) float64 { return metricstest.Value(c) }

func TestWaitForRateLimiterObservesTheWait(t *testing.T) {
	wait := prometheus.NewHistogram(prometheus.HistogramOpts{Name: "test_wait_seconds", Help: "test", Buckets: TimeBucketsSeconds})
	exceeded := prometheus.NewCounter(prometheus.CounterOpts{Name: "test_exceeded_total", Help: "test"})
	limiter := rate.NewLimiter(rate.Every(200*time.Millisecond), 1)

	for i := 0; i < 2; i++ {
		if err := WaitForRateLimiter(context.Background(), limiter, wait, exceeded); err != nil {
			t.Fatal(err)
		}
	}
	count, sum := histogramOf(wait)
	if count != 2 || sum < 0.15 {
		t.Errorf("want 2 observations with the second waiting ~0.2 s, got %d observations summing %.3f s", count, sum)
	}
	if got := counterOf(exceeded); got != 0 {
		t.Errorf("exceeded = %v, want 0", got)
	}
}

func TestWaitForRateLimiterCountsATimeout(t *testing.T) {
	wait := prometheus.NewHistogram(prometheus.HistogramOpts{Name: "test_wait_seconds", Help: "test", Buckets: TimeBucketsSeconds})
	exceeded := prometheus.NewCounter(prometheus.CounterOpts{Name: "test_exceeded_total", Help: "test"})
	limiter := rate.NewLimiter(rate.Every(time.Hour), 1)
	_ = limiter.Allow() // take the only token

	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()
	if err := WaitForRateLimiter(ctx, limiter, wait, exceeded); err == nil {
		t.Fatal("want an error from a limiter that cannot serve before the deadline")
	}
	if got := counterOf(exceeded); got != 1 {
		t.Errorf("exceeded = %v, want 1", got)
	}
	if count, _ := histogramOf(wait); count != 0 {
		t.Errorf("a wait that failed was observed: %d", count)
	}
}

func TestWaitForRateLimiterDoesNotCountACancellation(t *testing.T) {
	wait := prometheus.NewHistogram(prometheus.HistogramOpts{Name: "test_wait_seconds", Help: "test", Buckets: TimeBucketsSeconds})
	exceeded := prometheus.NewCounter(prometheus.CounterOpts{Name: "test_exceeded_total", Help: "test"})
	limiter := rate.NewLimiter(rate.Every(time.Hour), 1)
	_ = limiter.Allow() // take the only token

	// The connection ends while the subscribe message waits, as on a reconnection to Hasura.
	ctx, cancel := context.WithCancel(context.Background())
	time.AfterFunc(50*time.Millisecond, cancel)
	if err := WaitForRateLimiter(ctx, limiter, wait, exceeded); err == nil {
		t.Fatal("want an error from a wait whose context was cancelled")
	}
	if got := counterOf(exceeded); got != 0 {
		t.Errorf("exceeded = %v, want 0 for a cancelled wait", got)
	}
	if count, _ := histogramOf(wait); count != 0 {
		t.Errorf("a wait that failed was observed: %d", count)
	}
}
