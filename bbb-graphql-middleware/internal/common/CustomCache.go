package common

import (
	"sync"
	"time"
)

var GlobalCacheLocks = NewCacheLocks()

type CacheLocks struct {
	locks map[uint32]*sync.Mutex
	mutex sync.Mutex // Protects the 'locks' map
}

func NewCacheLocks() *CacheLocks {
	return &CacheLocks{
		locks: make(map[uint32]*sync.Mutex),
	}
}

func (c *CacheLocks) Lock(id uint32) {
	c.mutex.Lock()
	if _, exists := c.locks[id]; !exists {
		c.locks[id] = &sync.Mutex{}
	}
	mtx := c.locks[id]
	c.mutex.Unlock()

	mtx.Lock() // Lock the specific ID mutex
}

func (c *CacheLocks) Unlock(id uint32) {
	c.mutex.Lock()
	if mtx, exists := c.locks[id]; exists {
		mtx.Unlock()
		go c.RemoveLockId(id, 30)
	}
	c.mutex.Unlock()
}

func (c *CacheLocks) RemoveLockId(id uint32, delayInSecs time.Duration) {
	time.Sleep(delayInSecs * time.Second)

	c.mutex.Lock()
	if _, exists := c.locks[id]; exists {
		delete(c.locks, id)
	}
	c.mutex.Unlock()
}
