//go:build linux

package tap

import (
	"bytes"
	"errors"
	"io/fs"
	"maps"
	"os"
	"path"
	"path/filepath"
	"slices"
	"strings"
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

// maxSkipped is how many directories it can't watch Skipped lists.
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

	mu     sync.Mutex
	wds    map[int32]string  // watch descriptor -> directory, relative to root
	tops   map[string]error  // the directories asked for: nil once watched, else why not
	failed map[string]string // directories it can't watch, and why
	done   chan struct{}
	wg     sync.WaitGroup
}

// Watch watches dirs, relative to root, and everything under them.
// onEvent gets each file created or deleted, with its path relative to
// root; onGap is told when events were lost, and when a directory can't
// be watched. A directory that doesn't exist yet, or can't be watched
// yet, is watched once it can be.
func Watch(root string, dirs []string, onEvent func(path, op string), onGap func(why string)) (*Watcher, error) {
	fd, err := syscall.InotifyInit1(syscall.IN_CLOEXEC | syscall.IN_NONBLOCK)
	if err != nil {
		return nil, err
	}
	// Nonblocking, so reads go through the runtime's poller and Close
	// ends them.
	w := &Watcher{root: root, fd: fd, f: os.NewFile(uintptr(fd), "inotify"), onEvent: onEvent, onGap: onGap,
		wds: map[int32]string{}, tops: map[string]error{}, failed: map[string]string{}, done: make(chan struct{})}
	for _, d := range dirs {
		d = path.Clean(filepath.ToSlash(d))
		err := w.addTree(d, false)
		w.mu.Lock()
		w.tops[d] = err
		w.mu.Unlock()
		if err != nil {
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

// Tops lists the directories asked for that are watched now.
func (w *Watcher) Tops() []string {
	w.mu.Lock()
	defer w.mu.Unlock()
	var out []string
	for d, err := range w.tops {
		if err == nil {
			out = append(out, d)
		}
	}
	slices.Sort(out)
	return out
}

// Skipped says which directories it can't watch (the first few), and
// why.
func (w *Watcher) Skipped() []string {
	w.mu.Lock()
	defer w.mu.Unlock()
	var out []string
	for _, why := range w.failed {
		out = append(out, why)
	}
	slices.Sort(out)
	return out[:min(len(out), maxSkipped)]
}

// Covers says whether the files that come and go where pattern, a glob
// relative to root, can match are seen: pattern is under a directory
// asked for that is watched, or doesn't exist yet (once it does, it is
// watched, with a gap for what came and went before). When pattern is
// under one but may match where a directory can't be watched, why says
// so; it is "" for a pattern under none of them.
func (w *Watcher) Covers(pattern string) (ok bool, why string) {
	w.mu.Lock()
	defer w.mu.Unlock()
	under := false
	for top := range w.tops {
		under = under || underDir(pattern, top)
	}
	if !under {
		return false, ""
	}
	for _, dir := range slices.Sorted(maps.Keys(w.failed)) {
		if mayMatchUnder(pattern, dir) {
			return false, w.failed[dir]
		}
	}
	return true, ""
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
// directory under it that can't be is skipped. Both are gaps, unless
// the directory doesn't exist.
func (w *Watcher) addTree(dir string, report bool) error {
	top := filepath.Join(w.root, dir)
	return filepath.WalkDir(top, func(p string, d fs.DirEntry, err error) error {
		rel, _ := filepath.Rel(w.root, p)
		rel = filepath.ToSlash(rel)
		switch {
		case err == nil && d.IsDir():
			var wd int
			if wd, err = syscall.InotifyAddWatch(w.fd, p, watchMask|syscall.IN_ONLYDIR); err == nil {
				w.mu.Lock()
				w.wds[int32(wd)] = rel
				delete(w.failed, rel)
				w.mu.Unlock()
				return nil
			}
		case err == nil && p == top:
			err = syscall.ENOTDIR
		}
		switch {
		case err != nil:
			w.cannot(rel, err)
			if p == top {
				return err
			}
			if d != nil && d.IsDir() {
				return filepath.SkipDir
			}
		case report:
			w.onEvent(rel, "created")
		}
		return nil
	})
}

// cannot records that dir can't be watched, as a gap the first time for
// each reason. One that doesn't exist isn't: there is nothing in it to
// miss.
func (w *Watcher) cannot(dir string, err error) {
	if errors.Is(err, fs.ErrNotExist) {
		return
	}
	why := "can't watch " + dir + ": " + err.Error()
	w.mu.Lock()
	again := w.failed[dir] == why
	w.failed[dir] = why
	w.mu.Unlock()
	if !again {
		w.onGap(why)
	}
}

// retry watches dir once it can: it exists and can be watched. That is a
// gap, since files may have come and gone in it before; again says it was
// watched before.
func (w *Watcher) retry(dir string, again bool) {
	defer w.wg.Done()
	t := time.NewTicker(retryMissing)
	defer t.Stop()
	for {
		select {
		case <-w.done:
			return
		case <-t.C:
			err := w.addTree(dir, true)
			w.mu.Lock()
			w.tops[dir] = err
			w.mu.Unlock()
			if err == nil {
				if again {
					w.onGap("watching " + dir + " again: files may have come and gone in it while it wasn't")
				} else {
					w.onGap("watching " + dir + " now: files may have come and gone in it before")
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
	_, top := w.tops[dir]
	removed := ok && top && mask&syscall.IN_IGNORED != 0
	if mask&syscall.IN_IGNORED != 0 {
		delete(w.wds, wd)
		// What it couldn't watch under a directory that is gone is gone too;
		// watching it again finds out afresh.
		if ok {
			for d := range w.failed {
				if strings.HasPrefix(d, dir+"/") {
					delete(w.failed, d)
				}
			}
		}
	}
	if removed {
		w.tops[dir] = fs.ErrNotExist
	}
	w.mu.Unlock()
	// A directory asked for that goes away is watched again once it is
	// back. One below it is, by its parent's create event.
	if removed {
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
	case mask&syscall.IN_ISDIR != 0 && mask&(syscall.IN_DELETE|syscall.IN_MOVED_FROM) != 0:
		// What it couldn't watch there is gone: nothing there to miss now.
		w.mu.Lock()
		for d := range w.failed {
			if d == rel || strings.HasPrefix(d, rel+"/") {
				delete(w.failed, d)
			}
		}
		w.mu.Unlock()
	case mask&syscall.IN_ISDIR != 0:
	case mask&(syscall.IN_CREATE|syscall.IN_MOVED_TO) != 0:
		w.onEvent(rel, "created")
	case mask&(syscall.IN_DELETE|syscall.IN_MOVED_FROM) != 0:
		w.onEvent(rel, "deleted")
	}
}
