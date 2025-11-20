package document

import (
	"context"
	"sync"

	"golang.org/x/sync/semaphore"
)

var limits *Limits
var once sync.Once

// Limits manages the number of concurrently running
// resource-intensive processes in the application.
// Limits is intended to be a singleton and a single
// instance should be shared across the application.
type Limits struct {
	// ExecSlots bounds the number of resource-intensive
	// processes that can run concurrently.
	ExecSlots *semaphore.Weighted
	// PDFToImageSlots bounds the number of PDF to image
	// conversion processes that can run concurrently.
	PDFToImageSlots *semaphore.Weighted
	// TextExtractionSlots bounds the number of text
	// extraction processes that can run concurrently.
	TextExtractionSlots *semaphore.Weighted
	// PerDocParallelism bounds the number of pages
	// that can be processed conurrently per presentation.
	PerDocParallelism int64
}

// DefaultLimits creates and returns a new [Limits] instance
// with default bounds the first time this function is called.
// Subsequent invocations return the previously created instance.
func DefaultLimits() *Limits {
	once.Do(func() {
		limits = &Limits{
			ExecSlots:           semaphore.NewWeighted(8),
			PDFToImageSlots:     semaphore.NewWeighted(6),
			TextExtractionSlots: semaphore.NewWeighted(4),
			PerDocParallelism:   4,
		}
	})
	return limits
}

// Acquire acquires the provided semaphore with a weight of n, blocking
// until the resource becomes available or ctx is done. Returns a function
// that should be used to release the semaphore and possibly an error if
// semaphore acquisition fails.
func Acquire(ctx context.Context, sem *semaphore.Weighted, n int64) (func(), error) {
	if sem == nil {
		return func() {}, nil
	}
	if err := sem.Acquire(ctx, n); err != nil {
		return func() {}, err
	}
	return func() { sem.Release(n) }, nil
}
