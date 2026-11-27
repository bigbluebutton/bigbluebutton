package common

import (
	"context"
	"sync"
	"sync/atomic"
)

// SafeChannel is a channel that can be closed while senders use it, and frozen to hold them.
type SafeChannel[T any] struct {
	ch     chan T
	closed atomic.Bool
	frozen atomic.Bool // written only under mux, so it always matches thawed
	once   sync.Once

	// thawed is closed while the channel is not frozen. Freezing replaces it with an open channel;
	// unfreezing or closing closes it, which wakes every SendWait waiting on it.
	mux    sync.Mutex
	thawed chan struct{}
}

// SafeChannelByte carries raw messages.
type SafeChannelByte = SafeChannel[[]byte]

func NewSafeChannelByte(size int) *SafeChannelByte {
	return NewSafeChannel[[]byte](size)
}

func NewSafeChannel[T any](size int) *SafeChannel[T] {
	thawed := make(chan struct{})
	close(thawed)

	return &SafeChannel[T]{ch: make(chan T, size), thawed: thawed}
}

// TrySend never blocks; drops on closed/frozen/full.
// Uses recover to handle a close race (send on closed channel).
func (s *SafeChannel[T]) TrySend(value T) (ok bool) {
	if s.closed.Load() || s.frozen.Load() {
		return false
	}
	defer func() {
		if r := recover(); r != nil {
			ok = false
		}
	}()
	select {
	case s.ch <- value:
		return true
	default:
		return false
	}
}

// SendWait waits while the channel is frozen, then does a single blocking attempt. Both waits end
// when ctx is done. Recover handles a close race.
func (s *SafeChannel[T]) SendWait(ctx context.Context, value T) (ok bool) {
	s.mux.Lock()
	thawed := s.thawed
	s.mux.Unlock()

	select {
	case <-thawed:
	case <-ctx.Done():
		return false
	}

	if s.closed.Load() {
		return false
	}

	defer func() {
		if r := recover(); r != nil {
			// Likely "send on closed channel" due to a concurrent Close()
			ok = false
		}
	}()

	select {
	case s.ch <- value:
		return true
	case <-ctx.Done():
		return false
	}
}

func (s *SafeChannel[T]) Receive() (T, bool)       { v, ok := <-s.ch; return v, ok }
func (s *SafeChannel[T]) ReceiveChannel() <-chan T { return s.ch }

func (s *SafeChannel[T]) Closed() bool { return s.closed.Load() }

// Close is idempotent. Marks closed, releases the senders waiting on a freeze, then closes ch.
func (s *SafeChannel[T]) Close() {
	s.once.Do(func() {
		s.mux.Lock()
		s.closed.Store(true)
		s.thaw()
		s.mux.Unlock()
		close(s.ch)
	})
}

func (s *SafeChannel[T]) Frozen() bool { return s.frozen.Load() }

// FreezeChannel can be called multiple times. A closed channel is not frozen again.
func (s *SafeChannel[T]) FreezeChannel() {
	s.mux.Lock()
	defer s.mux.Unlock()

	if s.closed.Load() || s.frozen.Load() {
		return
	}
	s.thawed = make(chan struct{})
	s.frozen.Store(true)
}

// UnfreezeChannel clears the frozen state, unblocking all SendWait().
func (s *SafeChannel[T]) UnfreezeChannel() {
	s.mux.Lock()
	defer s.mux.Unlock()

	s.thaw()
}

// thaw must be called with mux held.
func (s *SafeChannel[T]) thaw() {
	if s.frozen.Load() {
		close(s.thawed)
		s.frozen.Store(false)
	}
}
