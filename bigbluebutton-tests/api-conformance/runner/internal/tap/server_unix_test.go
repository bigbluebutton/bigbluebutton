//go:build unix

package tap

import (
	"path/filepath"
	"syscall"
	"testing"
)

// A named pipe in the data directory is left out, not opened, which would
// wait for a writer.
func TestFilesNotRegular(t *testing.T) {
	w := startWorld(t)
	if err := syscall.Mkfifo(filepath.Join(w.dataDir, "pipe"), 0o644); err != nil {
		t.Skip(err)
	}
	m, err := w.client.Mark(ctx(t))
	if err != nil {
		t.Fatal(err)
	}
	if r, err := w.client.FS(ctx(t), m, "pipe"); err != nil || len(r.Files) != 0 {
		t.Errorf("%+v %v", r, err)
	}
}
