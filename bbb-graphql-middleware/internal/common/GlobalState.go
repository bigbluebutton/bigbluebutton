package common

import (
	"github.com/google/uuid"
	"sync"
	"time"
)

var uniqueID string

func InitUniqueID() {
	uniqueID = uuid.New().String()
}

func GetUniqueID() string {
	return uniqueID
}

var JsonPatchCache = make(map[string][]byte)
var JsonPatchCacheMutex sync.RWMutex

func GetJsonPatchCache(cacheKey string) ([]byte, bool) {
	JsonPatchCacheMutex.RLock()
	defer JsonPatchCacheMutex.RUnlock()

	jsonDiffPatch, jsonDiffPatchExists := JsonPatchCache[cacheKey]
	return jsonDiffPatch, jsonDiffPatchExists
}

func StoreJsonPatchCache(cacheKey string, data []byte) {
	JsonPatchCacheMutex.Lock()
	defer JsonPatchCacheMutex.Unlock()

	JsonPatchCache[cacheKey] = data

	//Remove the cache after 30 seconds
	go RemoveJsonPatchCache(cacheKey, 30)
}

func RemoveJsonPatchCache(cacheKey string, delayInSecs time.Duration) {
	time.Sleep(delayInSecs * time.Second)

	JsonPatchCacheMutex.Lock()
	defer JsonPatchCacheMutex.Unlock()
	delete(JsonPatchCache, cacheKey)
}
