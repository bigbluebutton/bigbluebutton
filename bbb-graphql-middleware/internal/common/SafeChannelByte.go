package common

import (
	"context"
	"sync"
	"sync/atomic"
)

type SafeChannelByte struct {
	ch     chan []byte
	closed atomic.Bool
	frozen atomic.Bool
	mux    sync.RWMutex
	once   sync.Once
}

func NewSafeChannelByte(size int) *SafeChannelByte {
	return &SafeChannelByte{ch: make(chan []byte, size)}
}

// TrySend never blocks; drops on closed/frozen/full.
// Uses recover to handle a close race (send on closed channel).
func (s *SafeChannelByte) TrySend(value []byte) (ok bool) {
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

// SendWait blocks while frozen (by acquiring RLock), then does a single
// blocking attempt governed by ctx. We do NOT hold RLock during the send,
// so Close() can proceed. Recover handles a close race.
func (s *SafeChannelByte) SendWait(ctx context.Context, value []byte) (ok bool) {
	// Block here if frozen (Freeze holds mux.Lock()).
	s.mux.RLock()
	if s.closed.Load() { // quick recheck under gate
		s.mux.RUnlock()
		return false
	}
	s.mux.RUnlock()

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

func (s *SafeChannelByte) Receive() ([]byte, bool)       { v, ok := <-s.ch; return v, ok }
func (s *SafeChannelByte) ReceiveChannel() <-chan []byte { return s.ch }

func (s *SafeChannelByte) Closed() bool { return s.closed.Load() }

// Close is idempotent. Marks closed, releases freeze if held, then closes ch.
func (s *SafeChannelByte) Close() {
	s.once.Do(func() {
		s.closed.Store(true)
		if s.frozen.Swap(false) {
			s.mux.Unlock() // release freeze gate if it was locked
		}
		close(s.ch)
	})
}

func (s *SafeChannelByte) Frozen() bool { return s.frozen.Load() }

// FreezeChannel can be called multiple times; only the first call locks the gate.
func (s *SafeChannelByte) FreezeChannel() {
	if !s.frozen.Swap(true) {
		s.mux.Lock()
	}
}

// UnfreezeChannel clears the frozen state and unlocks once, unblocking all SendWait().
func (s *SafeChannelByte) UnfreezeChannel() {
	if s.frozen.Swap(false) {
		s.mux.Unlock()
	}
}
