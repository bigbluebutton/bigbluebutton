//go:build !linux

package tap

import "errors"

// WatchSupported says whether file events can be watched here.
const WatchSupported = false

// Watcher stands in for the Linux file watcher; it watches nothing.
type Watcher struct{}

// Watch isn't supported off Linux: the tap then only sees files that
// exist when asked.
func Watch(root string, dirs []string, onEvent func(path, op string), onGap func(why string)) (*Watcher, error) {
	return nil, errors.New("watching files needs Linux (inotify)")
}

// Watching lists nothing.
func (w *Watcher) Watching() []string { return nil }

// Tops lists nothing.
func (w *Watcher) Tops() []string { return nil }

// Skipped lists nothing.
func (w *Watcher) Skipped() []string { return nil }

// Covers says no files are seen coming and going; Server.watched says
// why.
func (w *Watcher) Covers(pattern string) (bool, string) { return false, "" }

// Close does nothing.
func (w *Watcher) Close() error { return nil }
