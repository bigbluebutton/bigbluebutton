package common

import (
	"fmt"
	"sync"
)

var GlobalCacheLocks = NewCacheLocks()

type CacheLocks struct {
	locks map[string]*sync.Mutex
	mutex sync.Mutex // Protects the 'locks' map
}

func NewCacheLocks() *CacheLocks {
	return &CacheLocks{
		locks: make(map[string]*sync.Mutex),
	}
}

func (c *CacheLocks) Lock(id string) {
	c.mutex.Lock()
	if _, exists := c.locks[id]; !exists {
		c.locks[id] = &sync.Mutex{}
	}
	mtx := c.locks[id]
	c.mutex.Unlock()

	mtx.Lock() // Lock the specific ID mutex
}

func (c *CacheLocks) Unlock(id string) {
	c.mutex.Lock()
	if mtx, exists := c.locks[id]; exists {
		mtx.Unlock()
	}
	c.mutex.Unlock()
}

// Your cache management function
func ManageCache(id string, cacheLocks *CacheLocks) {
	cacheLocks.Lock(id)
	defer cacheLocks.Unlock(id)

	// Process the ID, ensuring that the same ID is not processed concurrently
	fmt.Println("Processing ID:", id)
	// Simulate processing
}
