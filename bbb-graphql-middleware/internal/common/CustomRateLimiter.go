package common

import (
	"context"
	"time"
)

type CustomRateLimiter struct {
	tokens       chan struct{}
	requestQueue chan context.Context
}

func NewCustomRateLimiter(requestsPerSecond int) *CustomRateLimiter {
	rl := &CustomRateLimiter{
		tokens:       make(chan struct{}, requestsPerSecond),
		requestQueue: make(chan context.Context, 20000), // Adjust the size accordingly
	}

	go rl.refillTokens(requestsPerSecond)
	go rl.processQueue()

	return rl
}

func (rl *CustomRateLimiter) refillTokens(requestsPerSecond int) {
	ticker := time.NewTicker(time.Second / time.Duration(requestsPerSecond))
	for {
		select {
		case <-ticker.C:
			// Try to add a token, skip if full
			select {
			case rl.tokens <- struct{}{}:
			default:
			}
		}
	}
}

func (rl *CustomRateLimiter) processQueue() {
	for ctx := range rl.requestQueue {
		select {
		case <-rl.tokens:
			if ctx.Err() == nil {
				// Token acquired and context not cancelled, proceed
				// Simulate processing by calling a dummy function
				// processRequest() or similar
			}
		case <-ctx.Done():
			// Context cancelled, skip
		}
	}
}

func (rl *CustomRateLimiter) Wait(ctx context.Context) error {
	rl.requestQueue <- ctx
	select {
	case <-ctx.Done():
		// Request cancelled
		return ctx.Err()
	case <-rl.tokens:
		// Acquired token, proceed
		return nil
	}
}
