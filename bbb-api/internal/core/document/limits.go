package document

import (
	"context"
	"sync"

	"golang.org/x/sync/semaphore"
)

var limits *Limits
var once sync.Once

type Limits struct {
	ExecSlots           *semaphore.Weighted
	PDFToImageSlots     *semaphore.Weighted
	TextExtractionSlots *semaphore.Weighted
	PerDocParallelism   int64
}

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

func Acquire(ctx context.Context, sem *semaphore.Weighted, n int64) (func(), error) {
	if sem == nil {
		return func() {}, nil
	}
	if err := sem.Acquire(ctx, n); err != nil {
		return func() {}, nil
	}
	return func() { sem.Release(n) }, nil
}
