package sink

import (
	"context"
	"sync"
	"time"
)

func size(r Request) int {
	n := len(r.Body) + len(r.Path) + len(r.RawQuery) + len(r.Key) + 256
	for k, vs := range r.Header {
		n += len(k)
		for _, v := range vs {
			n += len(v)
		}
	}
	return n
}

// Log keeps recorded requests for a while, up to a size, as the tap's log
// keeps what it saw. Requests never change once appended, so readers get
// them without holding the lock.
type Log struct {
	maxBytes int
	maxAge   time.Duration
	now      func() time.Time

	mu      sync.Mutex
	entries []Request
	last    int64 // the last sequence number given out
	bytes   int
	wake    chan struct{} // closed and replaced by each append
}

// NewLog keeps requests up to maxBytes in all, and none older than maxAge.
func NewLog(maxBytes int, maxAge time.Duration) *Log {
	return &Log{maxBytes: maxBytes, maxAge: maxAge, now: time.Now, wake: make(chan struct{})}
}

// Append numbers r, stores it and returns its sequence number.
func (l *Log) Append(r Request) int64 {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.last++
	r.Seq, r.At = l.last, l.now()
	l.entries = append(l.entries, r)
	l.bytes += size(r)
	drop := 0
	for drop < len(l.entries)-1 && (l.bytes > l.maxBytes || r.At.Sub(l.entries[drop].At) > l.maxAge) {
		l.bytes -= size(l.entries[drop])
		drop++
	}
	// Reslicing, not copying, keeps a full log's appends cheap: append
	// moves the live entries to a new array once the old one is used up,
	// and readers only ever read the part of an array they were handed.
	l.entries = l.entries[drop:]
	close(l.wake)
	l.wake = make(chan struct{})
	return r.Seq
}

// Last is the last sequence number given out, 0 before the first request.
func (l *Log) Last() int64 {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.last
}

// After returns the requests numbered after seq. truncated says some of
// them were already dropped.
func (l *Log) After(seq int64) (entries []Request, truncated bool) {
	l.mu.Lock()
	all := l.entries
	l.mu.Unlock()
	if len(all) == 0 {
		return nil, false
	}
	first := all[0].Seq
	if seq+1 < first {
		return all, true
	}
	i := int(seq + 1 - first)
	if i >= len(all) {
		return nil, false
	}
	return all[i:], false
}

// countBefore counts the requests to path numbered before seq that the
// log still holds.
func (l *Log) countBefore(path string, seq int64) int {
	all, _ := l.After(0)
	n := 0
	for _, e := range all {
		if e.Seq >= seq {
			break
		}
		if e.Path == path {
			n++
		}
	}
	return n
}

// Wait waits until a request numbered after seq exists, or ctx ends.
func (l *Log) Wait(ctx context.Context, seq int64) {
	for {
		l.mu.Lock()
		last, wake := l.last, l.wake
		l.mu.Unlock()
		if last > seq {
			return
		}
		select {
		case <-wake:
		case <-ctx.Done():
			return
		}
	}
}
