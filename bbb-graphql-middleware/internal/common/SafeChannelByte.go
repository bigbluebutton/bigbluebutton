package common

import (
	"sync"
)

type SafeChannelByte struct {
	ch         chan []byte
	closed     bool
	mux        sync.Mutex
	freezeFlag bool
}

func NewSafeChannelByte(size int) *SafeChannelByte {
	return &SafeChannelByte{
		ch: make(chan []byte, size),
	}
}

func (s *SafeChannelByte) Send(value []byte) bool {
	s.mux.Lock()
	defer s.mux.Unlock()

	if s.closed {
		return false
	}
	s.ch <- value
	return true
}

func (s *SafeChannelByte) Receive() ([]byte, bool) {
	val, ok := <-s.ch
	return val, ok
}

func (s *SafeChannelByte) ReceiveChannel() <-chan []byte {
	return s.ch
}

func (s *SafeChannelByte) Closed() bool {
	s.mux.Lock()
	defer s.mux.Unlock()

	return s.closed
}

func (s *SafeChannelByte) Close() {
	if s.Frozen() {
		s.UnfreezeChannel()
	}

	s.mux.Lock()
	defer s.mux.Unlock()

	if !s.closed {
		close(s.ch)
		s.closed = true
	}
}

func (s *SafeChannelByte) Frozen() bool {
	return s.freezeFlag
}

func (s *SafeChannelByte) FreezeChannel() {
	if !s.freezeFlag {
		s.mux.Lock()
		s.freezeFlag = true
	}
}

func (s *SafeChannelByte) UnfreezeChannel() {
	if s.freezeFlag {
		s.mux.Unlock()
		s.freezeFlag = false
	}
}
