package common

import (
	"sync"
)

type SafeChannel struct {
	ch     chan interface{}
	closed bool
	mux    sync.Mutex
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

func (s *SafeChannel) Close() {
	s.mux.Lock()
	defer s.mux.Unlock()

	if !s.closed {
		close(s.ch)
		s.closed = true
	}
}
