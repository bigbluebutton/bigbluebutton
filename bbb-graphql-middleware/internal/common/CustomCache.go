package common

import (
	"sync"
)

var GlobalCacheLocks = NewCacheLocks()

type refMutex struct {
	mutex    *sync.Mutex
	refCount int
}

type CacheLocks struct {
	locks map[uint32]*refMutex
	mutex sync.Mutex // Protects the 'locks' map
}

func NewCacheLocks() *CacheLocks {
	return &CacheLocks{
		locks: make(map[uint32]*refMutex),
	}
}

func (c *CacheLocks) Lock(id uint32) {
	var rm *refMutex

	c.mutex.Lock()
	if existingRm, exists := c.locks[id]; !exists {
		rm = &refMutex{
			mutex:    &sync.Mutex{},
			refCount: 1,
		}
		c.locks[id] = rm
	} else {
		rm = existingRm
		rm.refCount++
	}
	c.mutex.Unlock()

	// Lock rm.mutex outside of c.mutex to avoid deadlocks
	rm.mutex.Lock()
}

func (c *CacheLocks) Unlock(id uint32) {
	var rm *refMutex

	c.mutex.Lock()
	if existingRm, exists := c.locks[id]; exists {
		rm = existingRm
		rm.refCount--
		if rm.refCount == 0 {
			delete(c.locks, id)
		}
	} else {
		// Handle the case where Unlock is called without a corresponding Lock
		c.mutex.Unlock()
		return
	}
	c.mutex.Unlock()

	// Unlock rm.mutex outside of c.mutex to avoid deadlocks
	rm.mutex.Unlock()
}
