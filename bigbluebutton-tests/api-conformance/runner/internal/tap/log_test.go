package tap

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"
)

func seqs(es []Entry) string {
	out := make([]int64, len(es))
	for i, e := range es {
		out[i] = e.Seq
	}
	return fmt.Sprint(out)
}

func TestLog(t *testing.T) {
	l := NewLog(1000, time.Hour)
	now := time.Unix(1760000000, 0)
	l.now = func() time.Time { return now }
	if l.Last() != 0 {
		t.Fatal("a new log isn't empty")
	}
	for i := 0; i < 3; i++ {
		l.Append(Entry{Kind: "bus", Name: "M"})
	}
	if es, trunc := l.After(1); seqs(es) != "[2 3]" || trunc {
		t.Errorf("after 1: %v %v", seqs(es), trunc)
	}
	if es, _ := l.After(3); es != nil {
		t.Errorf("after the last: %v", seqs(es))
	}
	// Each entry counts 128 bytes plus its payload: this one pushes out the
	// oldest two, and the rest fits in 1000.
	l.Append(Entry{Kind: "bus", Raw: []byte(strings.Repeat("x", 700))})
	if es, trunc := l.After(0); seqs(es) != "[3 4]" || !trunc {
		t.Errorf("after eviction by size: %v %v", seqs(es), trunc)
	}
	now = now.Add(2 * time.Hour)
	l.Append(Entry{Kind: "gap", Why: "x"})
	if es, trunc := l.After(4); seqs(es) != "[5]" || trunc {
		t.Errorf("after eviction by age: %v %v", seqs(es), trunc)
	}
	if es, trunc := l.After(3); seqs(es) != "[5]" || !trunc {
		t.Errorf("after 3, once 4 is gone: %v %v", seqs(es), trunc)
	}
}

func TestLogWait(t *testing.T) {
	l := NewLog(1<<20, time.Hour)
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()
	start := time.Now()
	l.Wait(ctx, 0)
	if time.Since(start) < 40*time.Millisecond {
		t.Error("Wait returned before anything was appended")
	}
	go func() {
		time.Sleep(20 * time.Millisecond)
		l.Append(Entry{Kind: "bus"})
	}()
	start = time.Now()
	l.Wait(context.Background(), 0)
	if time.Since(start) > time.Second {
		t.Error("an append didn't wake Wait")
	}
}

// A full log drops its oldest entries without copying the rest, so an
// append costs the same however much the log holds; entries handed out
// earlier stay as they were.
func TestFullLogAppends(t *testing.T) {
	l := NewLog(10000*128, time.Hour)
	for range 20000 {
		l.Append(Entry{Kind: "bus"})
	}
	before, _ := l.After(l.Last() - 100)
	if a := testing.AllocsPerRun(1000, func() { l.Append(Entry{Kind: "bus"}) }); a > 1 {
		t.Errorf("%v allocations per append to a full log: it copies its entries", a)
	}
	for i, e := range before {
		if e.Seq != before[0].Seq+int64(i) {
			t.Fatalf("an entry handed out earlier changed: %d at %d", e.Seq, i)
		}
	}
}
