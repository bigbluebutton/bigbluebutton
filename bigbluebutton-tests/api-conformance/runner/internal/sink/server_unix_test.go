//go:build unix

package sink

import (
	"path/filepath"
	"syscall"
	"testing"
	"time"
)

// A named pipe among the fixtures is refused at once, not opened, which
// would wait for a writer.
func TestFixtureNotRegular(t *testing.T) {
	w := startWorld(t)
	if err := syscall.Mkfifo(filepath.Join(w.dir, "pipe.pdf"), 0o644); err != nil {
		t.Skip(err)
	}
	done := make(chan int, 1)
	go func() {
		resp, _ := w.send(t, "GET", "/fixtures/pipe.pdf", "")
		done <- resp.StatusCode
	}()
	select {
	case status := <-done:
		if status != 404 {
			t.Errorf("status %d", status)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("the sink waited on a named pipe")
	}
}
