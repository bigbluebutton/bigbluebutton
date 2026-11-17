package sink

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"
)

func seqs(rs []Request) string {
	out := make([]int64, len(rs))
	for i, r := range rs {
		out[i] = r.Seq
	}
	return fmt.Sprint(out)
}

func TestLog(t *testing.T) {
	l := NewLog(1000, time.Hour)
	now := time.Unix(1760000000, 0)
	l.now = func() time.Time { return now }
	for range 3 {
		l.Append(Request{Key: "k"})
	}
	if rs, trunc := l.After(1); seqs(rs) != "[2 3]" || trunc {
		t.Errorf("after 1: %v %v", seqs(rs), trunc)
	}
	if rs, _ := l.After(3); rs != nil {
		t.Errorf("after the last: %v", seqs(rs))
	}
	// Each request counts 256 bytes plus what it holds: this one pushes out
	// the oldest two, and the rest fits in 1000.
	l.Append(Request{Key: "k", Body: strings.Repeat("x", 400)})
	if rs, trunc := l.After(0); seqs(rs) != "[3 4]" || !trunc {
		t.Errorf("after eviction by size: %v %v", seqs(rs), trunc)
	}
	now = now.Add(2 * time.Hour)
	l.Append(Request{Key: "k"})
	if rs, trunc := l.After(3); seqs(rs) != "[5]" || !trunc {
		t.Errorf("after eviction by age: %v %v", seqs(rs), trunc)
	}
	// The newest request stays, however large.
	l.Append(Request{Key: "k", Body: strings.Repeat("x", 5000)})
	if rs, _ := l.After(0); seqs(rs) != "[6]" || l.Last() != 6 {
		t.Errorf("an oversized request: %v, last %d", seqs(rs), l.Last())
	}
}

func TestLogWait(t *testing.T) {
	l := NewLog(1<<20, time.Hour)
	done := make(chan struct{})
	go func() {
		l.Wait(context.Background(), 0)
		close(done)
	}()
	time.Sleep(50 * time.Millisecond)
	l.Append(Request{Key: "k"})
	select {
	case <-done:
	case <-time.After(5 * time.Second):
		t.Fatal("Wait didn't return after an append")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()
	l.Wait(ctx, 1) // returns when ctx ends
}
