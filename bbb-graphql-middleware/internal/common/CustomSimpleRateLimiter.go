package common

import (
	"context"
	"time"
)

type CustomSimpleRateLimiter struct {
	tokens          chan time.Time
	requestQueue    chan context.Context
	periodInSeconds time.Duration
}

func NewCustomSimpleRateLimiter(requestsPerPeriod int, periodInSeconds int) *CustomSimpleRateLimiter {
	rl := &CustomSimpleRateLimiter{
		tokens:          make(chan time.Time, requestsPerPeriod-1), // Decrease 1 once it is always processing the first
		requestQueue:    make(chan context.Context, 20000),         // Adjust the size accordingly
		periodInSeconds: time.Duration(periodInSeconds) * time.Second,
	}

	go rl.processQueue()

	return rl
}

func (rl *CustomSimpleRateLimiter) processQueue() {
	for ctx := range rl.requestQueue {
		select {
		case tokenAddedAt := <-rl.tokens:
			if ctx.Err() == nil {
				if time.Since(tokenAddedAt) < rl.periodInSeconds {
					//Sleep until reach time of next token
					time.Sleep(rl.periodInSeconds - time.Since(tokenAddedAt))
				}
				// Token acquired and context not cancelled, proceed
			}
		case <-ctx.Done():
			// Context cancelled, skip
		}
	}
}

func (rl *CustomSimpleRateLimiter) Wait(ctx context.Context) error {
	rl.requestQueue <- ctx
	select {
	case <-ctx.Done():
		// Request cancelled
		return ctx.Err()
	case rl.tokens <- time.Now():
		// Added Token
		return nil
	}
}
