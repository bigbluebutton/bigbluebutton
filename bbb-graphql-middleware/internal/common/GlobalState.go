package common

import (
	"bbb-graphql-middleware/config"
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

var PatchedMessageCache = make(map[uint32][]byte)
var PatchedMessageCacheMutex sync.RWMutex

func GetPatchedMessageCache(cacheKey uint32) ([]byte, bool) {
	PatchedMessageCacheMutex.RLock()
	defer PatchedMessageCacheMutex.RUnlock()

	jsonDiffPatch, jsonDiffPatchExists := PatchedMessageCache[cacheKey]
	return jsonDiffPatch, jsonDiffPatchExists
}

func StorePatchedMessageCache(cacheKey uint32, data []byte) {
	PatchedMessageCacheMutex.Lock()
	defer PatchedMessageCacheMutex.Unlock()

	PatchedMessageCache[cacheKey] = data

	//Remove the cache after 30 seconds
	go RemovePatchedMessageCache(cacheKey, 30)
}

func RemovePatchedMessageCache(cacheKey uint32, delayInSecs time.Duration) {
	time.Sleep(delayInSecs * time.Second)

	PatchedMessageCacheMutex.Lock()
	defer PatchedMessageCacheMutex.Unlock()
	delete(PatchedMessageCache, cacheKey)
}

var HasuraMessageCache = make(map[uint32]HasuraMessage)
var HasuraMessageKeyCache = make(map[uint32]string)
var HasuraMessageCacheMutex sync.RWMutex

func GetHasuraMessageCache(cacheKey uint32) (string, HasuraMessage, bool) {
	HasuraMessageCacheMutex.RLock()
	defer HasuraMessageCacheMutex.RUnlock()

	hasuraMessageDataKey, _ := HasuraMessageKeyCache[cacheKey]
	hasuraMessage, hasuraMessageExists := HasuraMessageCache[cacheKey]
	return hasuraMessageDataKey, hasuraMessage, hasuraMessageExists
}

func StoreHasuraMessageCache(cacheKey uint32, dataKey string, hasuraMessage HasuraMessage) {
	HasuraMessageCacheMutex.Lock()
	defer HasuraMessageCacheMutex.Unlock()

	HasuraMessageKeyCache[cacheKey] = dataKey
	HasuraMessageCache[cacheKey] = hasuraMessage

	//Remove the cache after 30 seconds
	go RemoveHasuraMessageCache(cacheKey, 30)
}

func RemoveHasuraMessageCache(cacheKey uint32, delayInSecs time.Duration) {
	time.Sleep(delayInSecs * time.Second)

	HasuraMessageCacheMutex.Lock()
	defer HasuraMessageCacheMutex.Unlock()
	delete(HasuraMessageKeyCache, cacheKey)
	delete(HasuraMessageCache, cacheKey)
}

var StreamCursorValueCache = make(map[uint32]interface{})
var StreamCursorValueCacheMutex sync.RWMutex

func GetStreamCursorValueCache(cacheKey uint32) (interface{}, bool) {
	StreamCursorValueCacheMutex.RLock()
	defer StreamCursorValueCacheMutex.RUnlock()

	streamCursorValue, streamCursorValueExists := StreamCursorValueCache[cacheKey]
	return streamCursorValue, streamCursorValueExists
}

func StoreStreamCursorValueCache(cacheKey uint32, streamCursorValue interface{}) {
	StreamCursorValueCacheMutex.Lock()
	defer StreamCursorValueCacheMutex.Unlock()

	StreamCursorValueCache[cacheKey] = streamCursorValue

	//Remove the cache after 30 seconds
	go RemoveStreamCursorValueCache(cacheKey, 30)
}

func RemoveStreamCursorValueCache(cacheKey uint32, delayInSecs time.Duration) {
	time.Sleep(delayInSecs * time.Second)

	StreamCursorValueCacheMutex.Lock()
	defer StreamCursorValueCacheMutex.Unlock()
	delete(StreamCursorValueCache, cacheKey)
}

var MaxConnPerSessionToken = config.GetConfig().Server.MaxConnectionsPerSessionToken
var MaxConnGlobal = config.GetConfig().Server.MaxConnections

func GetMaxConnectionsPerSessionToken() int {
	return MaxConnPerSessionToken
}

func GetMaxConnectionsGlobal() int {
	return MaxConnGlobal
}

var GlobalConnectionsCount int
var UserConnectionsCount = make(map[string]int)
var UserConnectionsCountMutex sync.RWMutex

func HasReachedMaxGlobalConnections() bool {
	if GetMaxConnectionsGlobal() == 0 {
		return true
	}

	return GlobalConnectionsCount >= GetMaxConnectionsGlobal()
}

func GetUserConnectionCount(sessionToken string) (int, bool) {
	UserConnectionsCountMutex.RLock()
	defer UserConnectionsCountMutex.RUnlock()

	numOfConn, userConnExists := UserConnectionsCount[sessionToken]
	return numOfConn, userConnExists
}

func HasReachedMaxUserConnections(sessionToken string) bool {
	if GetMaxConnectionsPerSessionToken() == 0 {
		return true
	}

	numOfConn, _ := GetUserConnectionCount(sessionToken)

	return numOfConn >= GetMaxConnectionsPerSessionToken()
}

func AddUserConnection(sessionToken string) {
	UserConnectionsCountMutex.Lock()
	defer UserConnectionsCountMutex.Unlock()

	GlobalConnectionsCount++
	UserConnectionsCount[sessionToken]++
}

func RemoveUserConnection(sessionToken string) {
	UserConnectionsCountMutex.Lock()
	defer UserConnectionsCountMutex.Unlock()

	GlobalConnectionsCount--
	UserConnectionsCount[sessionToken]--
	if UserConnectionsCount[sessionToken] <= 0 {
		delete(UserConnectionsCount, sessionToken)
	}
}
