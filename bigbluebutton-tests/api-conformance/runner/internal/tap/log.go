// Package tap watches a BigBlueButton server from next to it: the
// messages on its redis bus, the files its components write under the
// data directory, and its redis keys. It serves them to the runner over
// HTTP, so steps can check what never shows in an API response.
package tap

import (
	"context"
	"sync"
	"time"
)

// Entry is one thing the tap saw, in the order it saw them.
type Entry struct {
	Seq  int64
	At   time.Time
	Kind string // "bus", "file" or "gap"

	Channel string   // bus
	Name    string   // bus: the message name
	IDs     []string // bus: the meeting IDs the message is about
	Raw     []byte   // bus: the message as published

	Path string // file: relative to the data directory
	Op   string // file: "created" or "deleted"

	Why string // gap: what the tap may have missed
	Of  string // gap: "bus" or "files"
}

func (e Entry) size() int { return len(e.Raw) + len(e.Path) + 128 }

// Log keeps entries for a while, up to a size. Entries never change once
// appended, so readers get them without holding the lock.
type Log struct {
	maxBytes int
	maxAge   time.Duration
	now      func() time.Time

	mu      sync.Mutex
	entries []Entry
	last    int64 // the last sequence number given out
	bytes   int
	wake    chan struct{} // closed and replaced by each append
}

// NewLog keeps entries up to maxBytes in all, and none older than maxAge.
func NewLog(maxBytes int, maxAge time.Duration) *Log {
	return &Log{maxBytes: maxBytes, maxAge: maxAge, now: time.Now, wake: make(chan struct{})}
}

// Append numbers e, stores it and returns its sequence number.
func (l *Log) Append(e Entry) int64 {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.last++
	e.Seq, e.At = l.last, l.now()
	l.entries = append(l.entries, e)
	l.bytes += e.size()
	drop := 0
	for drop < len(l.entries)-1 && (l.bytes > l.maxBytes || e.At.Sub(l.entries[drop].At) > l.maxAge) {
		l.bytes -= l.entries[drop].size()
		drop++
	}
	// Reslicing, not copying, keeps a full log's appends cheap: append
	// moves the live entries to a new array once the old one is used up,
	// and readers only ever read the part of an array they were handed.
	l.entries = l.entries[drop:]
	close(l.wake)
	l.wake = make(chan struct{})
	return e.Seq
}

// Last is the last sequence number given out, 0 before the first entry.
func (l *Log) Last() int64 {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.last
}

// After returns the entries numbered after seq. truncated says some of
// them were already dropped to keep the log's size.
func (l *Log) After(seq int64) (entries []Entry, truncated bool) {
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

// Wait waits until an entry numbered after seq exists, or ctx ends.
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
