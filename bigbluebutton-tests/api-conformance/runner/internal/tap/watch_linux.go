//go:build linux

package tap

import (
	"bytes"
	"errors"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"slices"
	"sync"
	"syscall"
	"time"
	"unsafe"
)

// WatchSupported says whether file events can be watched here.
const WatchSupported = true

const watchMask = syscall.IN_CREATE | syscall.IN_MOVED_TO | syscall.IN_DELETE | syscall.IN_MOVED_FROM | syscall.IN_DELETE_SELF

// retryMissing is how often a directory to watch that doesn't exist, yet
// or any more, is looked for again.
var retryMissing = time.Second

// maxSkipped is how many directories it couldn't watch Skipped lists.
const maxSkipped = 10

// Watcher reports the files created and deleted under some directories,
// with inotify. It sees a file even when another process deletes it
// right away, as record-and-playback does with recording markers.
type Watcher struct {
	root    string
	fd      int // for adding watches: f.Fd() would make reads blocking
	f       *os.File
	onEvent func(path, op string)
	onGap   func(why string)

	mu   sync.Mutex
	wds  map[int32]string // watch descriptor -> directory, relative to root
	tops map[string]bool  // the directories asked for
	skip []string         // directories it couldn't watch, and why
	done chan struct{}
	wg   sync.WaitGroup
}

// Watch watches dirs, relative to root, and everything under them.
// onEvent gets each file created or deleted, with its path relative to
// root; onGap is told when events were lost. A directory that doesn't
// exist yet is watched once it does.
func Watch(root string, dirs []string, onEvent func(path, op string), onGap func(why string)) (*Watcher, error) {
	fd, err := syscall.InotifyInit1(syscall.IN_CLOEXEC | syscall.IN_NONBLOCK)
	if err != nil {
		return nil, err
	}
	// Nonblocking, so reads go through the runtime's poller and Close
	// ends them.
	w := &Watcher{root: root, fd: fd, f: os.NewFile(uintptr(fd), "inotify"), onEvent: onEvent, onGap: onGap,
		wds: map[int32]string{}, tops: map[string]bool{}, done: make(chan struct{})}
	for _, d := range dirs {
		d = path.Clean(filepath.ToSlash(d))
		w.tops[d] = true
		if err := w.addTree(d, false); err != nil {
			w.wg.Add(1)
			go w.retry(d, false)
		}
	}
	w.wg.Add(1)
	go w.read()
	return w, nil
}

// Watching lists the directories watched, relative to root.
func (w *Watcher) Watching() []string {
	w.mu.Lock()
	defer w.mu.Unlock()
	out := make([]string, 0, len(w.wds))
	for _, d := range w.wds {
		out = append(out, d)
	}
	return out
}

// Skipped says which directories under those asked for it couldn't
// watch (the first few), and why.
func (w *Watcher) Skipped() []string {
	w.mu.Lock()
	defer w.mu.Unlock()
	return slices.Clone(w.skip)
}

// Close stops watching.
func (w *Watcher) Close() error {
	select {
	case <-w.done:
	default:
		close(w.done)
	}
	err := w.f.Close() // ends the read
	w.wg.Wait()
	return err
}

// addTree watches dir and every directory under it. With report, the
// files already in them are reported as created: they appeared before
// the watch did. It fails only if dir itself can't be watched; a
// directory under it that can't be is reported as a gap and skipped.
func (w *Watcher) addTree(dir string, report bool) error {
	top := filepath.Join(w.root, dir)
	return filepath.WalkDir(top, func(p string, d fs.DirEntry, err error) error {
		rel, _ := filepath.Rel(w.root, p)
		rel = filepath.ToSlash(rel)
		if err == nil && d.IsDir() {
			var wd int
			if wd, err = syscall.InotifyAddWatch(w.fd, p, watchMask|syscall.IN_ONLYDIR); err == nil {
				w.mu.Lock()
				w.wds[int32(wd)] = rel
				w.mu.Unlock()
				return nil
			}
		}
		switch {
		case err != nil && p == top:
			return err
		case err != nil:
			why := "can't watch " + rel + ": " + err.Error()
			w.mu.Lock()
			if len(w.skip) < maxSkipped {
				w.skip = append(w.skip, why)
			}
			w.mu.Unlock()
			w.onGap(why)
			if d != nil && d.IsDir() {
				return filepath.SkipDir
			}
		case report:
			w.onEvent(rel, "created")
		}
		return nil
	})
}

// retry watches dir once it exists. gap says it was watched before, so
// files may have come and gone in it unseen.
func (w *Watcher) retry(dir string, gap bool) {
	defer w.wg.Done()
	t := time.NewTicker(retryMissing)
	defer t.Stop()
	for {
		select {
		case <-w.done:
			return
		case <-t.C:
			if w.addTree(dir, true) == nil {
				if gap {
					w.onGap("watching " + dir + " again: files may have come and gone in it while it wasn't")
				}
				return
			}
		}
	}
}

func (w *Watcher) read() {
	defer w.wg.Done()
	buf := make([]byte, 64<<10)
	for {
		n, err := w.f.Read(buf)
		if err != nil {
			if !errors.Is(err, os.ErrClosed) {
				select {
				case <-w.done:
				default:
					w.onGap("reading file events failed: " + err.Error())
				}
			}
			return
		}
		for off := 0; off+syscall.SizeofInotifyEvent <= n; {
			ev := (*syscall.InotifyEvent)(unsafe.Pointer(&buf[off]))
			name := buf[off+syscall.SizeofInotifyEvent : off+syscall.SizeofInotifyEvent+int(ev.Len)]
			off += syscall.SizeofInotifyEvent + int(ev.Len)
			w.event(ev.Wd, ev.Mask, string(bytes.TrimRight(name, "\x00")))
		}
	}
}

func (w *Watcher) event(wd int32, mask uint32, name string) {
	if mask&syscall.IN_Q_OVERFLOW != 0 {
		w.onGap("too many file events at once: some were lost")
		return
	}
	w.mu.Lock()
	dir, ok := w.wds[wd]
	if mask&syscall.IN_IGNORED != 0 {
		delete(w.wds, wd)
	}
	w.mu.Unlock()
	// A directory asked for that goes away is watched again once it is
	// back. One below it is, by its parent's create event.
	if ok && mask&syscall.IN_IGNORED != 0 && w.tops[dir] {
		select {
		case <-w.done:
		default:
			w.onGap("stopped watching " + dir + ": it was removed")
			w.wg.Add(1)
			go w.retry(dir, true)
		}
		return
	}
	if !ok || name == "" {
		return
	}
	rel := path.Join(dir, name)
	switch {
	case mask&syscall.IN_ISDIR != 0 && mask&(syscall.IN_CREATE|syscall.IN_MOVED_TO) != 0:
		_ = w.addTree(rel, true) // it may be gone already
	case mask&syscall.IN_ISDIR != 0:
	case mask&(syscall.IN_CREATE|syscall.IN_MOVED_TO) != 0:
		w.onEvent(rel, "created")
	case mask&(syscall.IN_DELETE|syscall.IN_MOVED_FROM) != 0:
		w.onEvent(rel, "deleted")
	}
}
