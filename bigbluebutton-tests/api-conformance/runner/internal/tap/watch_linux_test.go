//go:build linux

package tap

import (
	"os"
	"path/filepath"
	"slices"
	"sync"
	"testing"
	"time"
)

type events struct {
	mu   sync.Mutex
	seen []string
}

func (e *events) add(path, op string) {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.seen = append(e.seen, op+" "+path)
}

// waitFor waits for want among the events.
func (e *events) waitFor(t *testing.T, want string) {
	t.Helper()
	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) {
		e.mu.Lock()
		ok := slices.Contains(e.seen, want)
		e.mu.Unlock()
		if ok {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	e.mu.Lock()
	defer e.mu.Unlock()
	t.Errorf("no %q in %v", want, e.seen)
}

func TestWatch(t *testing.T) {
	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, "recording/status/recorded"), 0o755); err != nil {
		t.Fatal(err)
	}
	var ev events
	w, err := Watch(root, []string{"recording/status", "learning-dashboard"}, ev.add, func(why string) { t.Errorf("gap: %s", why) })
	if err != nil {
		t.Fatal(err)
	}
	defer w.Close()

	// A marker that is deleted right away, as rap-starter does, is still
	// seen.
	marker := filepath.Join(root, "recording/status/recorded/m1.done")
	if err := os.WriteFile(marker, nil, 0o644); err != nil {
		t.Fatal(err)
	}
	os.Remove(marker)
	ev.waitFor(t, "created recording/status/recorded/m1.done")
	ev.waitFor(t, "deleted recording/status/recorded/m1.done")

	// A new directory is watched, and a file written into it before the
	// watch existed still counts.
	dir := filepath.Join(root, "recording/status/ended")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "m2.done"), nil, 0o644); err != nil {
		t.Fatal(err)
	}
	ev.waitFor(t, "created recording/status/ended/m2.done")

	// A directory that didn't exist when the watch began is picked up
	// later. (The retry runs every few seconds; this checks the start.)
	if !slices.Contains(w.Watching(), "recording/status/recorded") {
		t.Errorf("watching %v", w.Watching())
	}
}

func TestWatchClose(t *testing.T) {
	w, err := Watch(t.TempDir(), nil, func(string, string) {}, func(string) {})
	if err != nil {
		t.Fatal(err)
	}
	done := make(chan struct{})
	go func() { w.Close(); close(done) }()
	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("Close didn't end the read")
	}
}
