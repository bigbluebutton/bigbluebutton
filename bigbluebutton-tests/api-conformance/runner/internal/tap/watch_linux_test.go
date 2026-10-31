//go:build linux

package tap

import (
	"os"
	"path/filepath"
	"slices"
	"strings"
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

func gapsTo(ev *events) func(string) { return func(why string) { ev.add(why, "gap") } }

// A directory under a watched one that can't be watched is a gap, once;
// the files around it aren't reported as new over and over.
func TestWatchUnwatchableDir(t *testing.T) {
	if os.Geteuid() == 0 {
		t.Skip("root can watch any directory")
	}
	retryMissing = 20 * time.Millisecond
	t.Cleanup(func() { retryMissing = time.Second })
	root := t.TempDir()
	for _, d := range []string{"recording/status/recorded", "recording/status/locked"} {
		if err := os.MkdirAll(filepath.Join(root, d), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	if err := os.WriteFile(filepath.Join(root, "recording/status/recorded/old.done"), nil, 0o644); err != nil {
		t.Fatal(err)
	}
	locked := filepath.Join(root, "recording/status/locked")
	if err := os.Chmod(locked, 0); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { os.Chmod(locked, 0o755) })
	var ev events
	w, err := Watch(root, []string{"recording/status"}, ev.add, gapsTo(&ev))
	if err != nil {
		t.Fatal(err)
	}
	defer w.Close()
	if err := os.WriteFile(filepath.Join(root, "recording/status/recorded/new.done"), nil, 0o644); err != nil {
		t.Fatal(err)
	}
	ev.waitFor(t, "created recording/status/recorded/new.done")
	time.Sleep(10 * retryMissing)
	ev.mu.Lock()
	defer ev.mu.Unlock()
	if got := strings.Join(ev.seen, "\n"); got != "gap can't watch recording/status/locked: permission denied\ncreated recording/status/recorded/new.done" {
		t.Errorf("events:\n%s", got)
	}
	if s := w.Skipped(); len(s) != 1 || !strings.Contains(s[0], "recording/status/locked") {
		t.Errorf("skipped %v", s)
	}
	// Files under it aren't seen coming and going, and that is said;
	// those beside it are. Outside the directories asked for, nothing is
	// seen and nothing needs saying.
	for pattern, want := range map[string]string{
		"recording/status/recorded/x.done": "covered",
		"recording/status/locked/x.done":   "can't watch recording/status/locked: permission denied",
		"recording/status/*/x.done":        "can't watch recording/status/locked: permission denied",
		"recording/status/x.done":          "covered",
		"published/x":                      "",
	} {
		ok, why := w.Covers(pattern)
		if ok {
			why = "covered"
		}
		if why != want {
			t.Errorf("Covers(%s) = %t, %q", pattern, ok, why)
		}
	}
	// Once it is gone, there is nothing there to miss.
	os.Chmod(locked, 0o755)
	if err := os.Remove(locked); err != nil {
		t.Fatal(err)
	}
	for deadline := time.Now().Add(3 * time.Second); len(w.Skipped()) > 0 && time.Now().Before(deadline); {
		time.Sleep(10 * time.Millisecond)
	}
	if ok, why := w.Covers("recording/status/locked/x.done"); !ok {
		t.Errorf("after it was removed: %q, skipped %v", why, w.Skipped())
	}
}

// A directory asked for that can't be watched is a gap once, isn't
// covered, and is watched once it can be. One that doesn't exist yet is
// covered: it is watched, and its files reported, as soon as it does.
func TestWatchUnwatchableTop(t *testing.T) {
	retryMissing = 20 * time.Millisecond
	t.Cleanup(func() { retryMissing = time.Second })
	root := t.TempDir()
	status := filepath.Join(root, "recording/status")
	if err := os.MkdirAll(filepath.Dir(status), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(status, nil, 0o644); err != nil {
		t.Fatal(err)
	}
	var ev events
	w, err := Watch(root, []string{"recording/status", "learning-dashboard"}, ev.add, gapsTo(&ev))
	if err != nil {
		t.Fatal(err)
	}
	defer w.Close()
	time.Sleep(10 * retryMissing)
	ev.mu.Lock()
	got := strings.Join(ev.seen, "\n")
	ev.mu.Unlock()
	if got != "gap can't watch recording/status: not a directory" {
		t.Errorf("events:\n%s", got)
	}
	status1, why := w.Covers("recording/status/recorded/m.done")
	dashboard, _ := w.Covers("learning-dashboard/m/t/data.json")
	if status1 || why != "can't watch recording/status: not a directory" || !dashboard || len(w.Tops()) != 0 {
		t.Errorf("covers status %t (%q), dashboard %t, tops %v", status1, why, dashboard, w.Tops())
	}
	if s := w.Skipped(); len(s) != 1 || !strings.Contains(s[0], "not a directory") {
		t.Errorf("skipped %v", s)
	}

	if err := os.Remove(status); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Join(status, "recorded"), 0o755); err != nil {
		t.Fatal(err)
	}
	covered := func() bool { ok, _ := w.Covers("recording/status/recorded/m.done"); return ok }
	for deadline := time.Now().Add(3 * time.Second); !covered() && time.Now().Before(deadline); {
		time.Sleep(10 * time.Millisecond)
	}
	if !covered() || !slices.Equal(w.Tops(), []string{"recording/status"}) || len(w.Skipped()) != 0 {
		t.Errorf("once it is a directory: tops %v, skipped %v", w.Tops(), w.Skipped())
	}
	marker := filepath.Join(status, "recorded/m.done")
	if err := os.WriteFile(marker, nil, 0o644); err != nil {
		t.Fatal(err)
	}
	os.Remove(marker)
	ev.waitFor(t, "created recording/status/recorded/m.done")
}

// A directory asked for that appears later is watched, with a gap: files
// may have come and gone in it before the watch did.
func TestWatchAppearingTop(t *testing.T) {
	retryMissing = 20 * time.Millisecond
	t.Cleanup(func() { retryMissing = time.Second })
	root := t.TempDir()
	var ev events
	w, err := Watch(root, []string{"learning-dashboard"}, ev.add, gapsTo(&ev))
	if err != nil {
		t.Fatal(err)
	}
	defer w.Close()
	if ok, why := w.Covers("learning-dashboard/m/t/d.json"); !ok {
		t.Errorf("not yet there, but covered: %q", why)
	}
	if err := os.MkdirAll(filepath.Join(root, "learning-dashboard/m"), 0o755); err != nil {
		t.Fatal(err)
	}
	ev.waitFor(t, "gap watching learning-dashboard now: files may have come and gone in it before")
}

// What couldn't be watched under a directory that is removed is forgotten,
// so once the directory is back without it, nothing there is missed.
func TestWatchForgetsWhatWentAway(t *testing.T) {
	if os.Geteuid() == 0 {
		t.Skip("root can watch any directory")
	}
	retryMissing = 20 * time.Millisecond
	t.Cleanup(func() { retryMissing = time.Second })
	root := t.TempDir()
	status := filepath.Join(root, "recording/status")
	locked := filepath.Join(status, "locked")
	if err := os.MkdirAll(locked, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.Chmod(locked, 0); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { os.Chmod(locked, 0o755) })
	var ev events
	w, err := Watch(root, []string{"recording/status"}, ev.add, gapsTo(&ev))
	if err != nil {
		t.Fatal(err)
	}
	defer w.Close()
	if ok, _ := w.Covers("recording/status/*/x.done"); ok {
		t.Fatal("covered though locked can't be watched")
	}
	os.Chmod(locked, 0o755)
	if err := os.RemoveAll(status); err != nil {
		t.Fatal(err)
	}
	ev.waitFor(t, "gap stopped watching recording/status: it was removed")
	if err := os.MkdirAll(filepath.Join(status, "recorded"), 0o755); err != nil {
		t.Fatal(err)
	}
	ev.waitFor(t, "gap watching recording/status again: files may have come and gone in it while it wasn't")
	if ok, why := w.Covers("recording/status/*/x.done"); !ok {
		t.Errorf("once it is back without locked: %q", why)
	}
}

// A directory asked for that is removed is a gap, and is watched again
// once it is back.
func TestWatchRemovedDir(t *testing.T) {
	retryMissing = 20 * time.Millisecond
	t.Cleanup(func() { retryMissing = time.Second })
	root := t.TempDir()
	status := filepath.Join(root, "recording/status")
	if err := os.MkdirAll(filepath.Join(status, "recorded"), 0o755); err != nil {
		t.Fatal(err)
	}
	var ev events
	w, err := Watch(root, []string{"recording/status"}, ev.add, gapsTo(&ev))
	if err != nil {
		t.Fatal(err)
	}
	defer w.Close()
	if err := os.RemoveAll(status); err != nil {
		t.Fatal(err)
	}
	ev.waitFor(t, "gap stopped watching recording/status: it was removed")
	if err := os.MkdirAll(filepath.Join(status, "recorded"), 0o755); err != nil {
		t.Fatal(err)
	}
	ev.waitFor(t, "gap watching recording/status again: files may have come and gone in it while it wasn't")
	marker := filepath.Join(status, "recorded/m.done")
	if err := os.WriteFile(marker, nil, 0o644); err != nil {
		t.Fatal(err)
	}
	os.Remove(marker)
	ev.waitFor(t, "created recording/status/recorded/m.done")
}
