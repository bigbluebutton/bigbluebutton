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

// Close does nothing.
func (w *Watcher) Close() error { return nil }
