package common

import (
	"sync"
)

type SafeChannel struct {
	ch         chan interface{}
	closed     bool
	mux        sync.Mutex
	freezeFlag bool
}

func NewSafeChannel(size int) *SafeChannel {
	return &SafeChannel{
		ch: make(chan interface{}, size),
	}
}

func (s *SafeChannel) Send(value interface{}) bool {
	s.mux.Lock()
	defer s.mux.Unlock()

	if s.closed {
		return false
	}
	s.ch <- value
	return true
}

func (s *SafeChannel) Receive() (interface{}, bool) {
	val, ok := <-s.ch
	return val, ok
}

func (s *SafeChannel) ReceiveChannel() <-chan interface{} {
	return s.ch
}

func (s *SafeChannel) Closed() bool {
	s.mux.Lock()
	defer s.mux.Unlock()

	return s.closed
}

func (s *SafeChannel) Close() {
	s.mux.Lock()
	defer s.mux.Unlock()

	if !s.closed {
		close(s.ch)
		s.closed = true
	}
}

func (s *SafeChannel) Frozen() bool {
	return s.freezeFlag
}

func (s *SafeChannel) FreezeChannel() {
	if !s.freezeFlag {
		s.mux.Lock()
		s.freezeFlag = true
	}
}

func (s *SafeChannel) UnfreezeChannel() {
	if s.freezeFlag {
		s.mux.Unlock()
		s.freezeFlag = false
	}
}
