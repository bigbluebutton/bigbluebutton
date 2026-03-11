package common

import (
	"sync"
	"time"

	"bbb-graphql-middleware/config"

	"github.com/google/uuid"
)

var uniqueID string

func InitUniqueID() {
	uniqueID = uuid.New().String()
}

func GetUniqueID() string {
	return uniqueID
}

var (
	PatchedMessageCache      = make(map[string]map[uint64][]byte)
	PatchedMessageCacheMutex sync.RWMutex
)

func GetPatchedMessageCache(meetingId string, cacheKey uint64) ([]byte, bool) {
	PatchedMessageCacheMutex.RLock()
	defer PatchedMessageCacheMutex.RUnlock()

	jsonDiffPatch, jsonDiffPatchExists := PatchedMessageCache[meetingId][cacheKey]
	return jsonDiffPatch, jsonDiffPatchExists
}

func StorePatchedMessageCache(meetingId string, cacheKey uint64, data []byte) {
	PatchedMessageCacheMutex.Lock()
	defer PatchedMessageCacheMutex.Unlock()

	if _, jsonDiffPatchExists := PatchedMessageCache[meetingId]; !jsonDiffPatchExists {
		PatchedMessageCache[meetingId] = make(map[uint64][]byte)
	}

	PatchedMessageCache[meetingId][cacheKey] = data

	// Remove the cache after 30 seconds
	go RemovePatchedMessageCache(meetingId, cacheKey, 30)
}

func RemovePatchedMessageCache(meetingId string, cacheKey uint64, delayInSecs time.Duration) {
	time.Sleep(delayInSecs * time.Second)

	PatchedMessageCacheMutex.Lock()
	defer PatchedMessageCacheMutex.Unlock()
	delete(PatchedMessageCache[meetingId], cacheKey)
}

func RemoveMeetingPatchedMessageCache(meetingId string) {
	PatchedMessageCacheMutex.Lock()
	defer PatchedMessageCacheMutex.Unlock()
	delete(PatchedMessageCache, meetingId)
}

var (
	HasuraMessageCache      = make(map[string]map[uint32]HasuraMessage)
	HasuraMessageKeyCache   = make(map[string]map[uint32]string)
	HasuraMessageCacheMutex sync.RWMutex
)

func GetHasuraMessageCache(meetingId string, cacheKey uint32) (string, HasuraMessage, bool) {
	HasuraMessageCacheMutex.RLock()
	defer HasuraMessageCacheMutex.RUnlock()

	hasuraMessageDataKey, _ := HasuraMessageKeyCache[meetingId][cacheKey]
	hasuraMessage, hasuraMessageExists := HasuraMessageCache[meetingId][cacheKey]
	return hasuraMessageDataKey, hasuraMessage, hasuraMessageExists
}

func StoreHasuraMessageCache(meetingId string, cacheKey uint32, dataKey string, hasuraMessage HasuraMessage) {
	HasuraMessageCacheMutex.Lock()
	defer HasuraMessageCacheMutex.Unlock()

	if _, jsonDiffPatchExists := HasuraMessageKeyCache[meetingId]; !jsonDiffPatchExists {
		HasuraMessageKeyCache[meetingId] = make(map[uint32]string)
	}
	if _, jsonDiffPatchExists := HasuraMessageCache[meetingId]; !jsonDiffPatchExists {
		HasuraMessageCache[meetingId] = make(map[uint32]HasuraMessage)
	}

	HasuraMessageKeyCache[meetingId][cacheKey] = dataKey
	HasuraMessageCache[meetingId][cacheKey] = hasuraMessage

	// Remove the cache after 30 seconds
	go RemoveHasuraMessageCache(meetingId, cacheKey, 30)
}

func RemoveHasuraMessageCache(meetingId string, cacheKey uint32, delayInSecs time.Duration) {
	time.Sleep(delayInSecs * time.Second)

	HasuraMessageCacheMutex.Lock()
	defer HasuraMessageCacheMutex.Unlock()
	delete(HasuraMessageKeyCache[meetingId], cacheKey)
	delete(HasuraMessageCache[meetingId], cacheKey)
}

func RemoveMeetingHasuraMessageCache(meetingId string) {
	HasuraMessageCacheMutex.Lock()
	defer HasuraMessageCacheMutex.Unlock()
	delete(HasuraMessageKeyCache, meetingId)
	delete(HasuraMessageCache, meetingId)
}

var (
	StreamCursorValueCache      = make(map[string]map[uint32]interface{})
	StreamCursorValueCacheMutex sync.RWMutex
)

func GetStreamCursorValueCache(meetingId string, cacheKey uint32) (interface{}, bool) {
	StreamCursorValueCacheMutex.RLock()
	defer StreamCursorValueCacheMutex.RUnlock()

	streamCursorValue, streamCursorValueExists := StreamCursorValueCache[meetingId][cacheKey]
	return streamCursorValue, streamCursorValueExists
}

func StoreStreamCursorValueCache(meetingId string, cacheKey uint32, streamCursorValue interface{}) {
	StreamCursorValueCacheMutex.Lock()
	defer StreamCursorValueCacheMutex.Unlock()

	if _, jsonDiffPatchExists := StreamCursorValueCache[meetingId]; !jsonDiffPatchExists {
		StreamCursorValueCache[meetingId] = make(map[uint32]interface{})
	}

	StreamCursorValueCache[meetingId][cacheKey] = streamCursorValue

	// Remove the cache after 30 seconds
	go RemoveStreamCursorValueCache(meetingId, cacheKey, 30)
}

func RemoveStreamCursorValueCache(meetingId string, cacheKey uint32, delayInSecs time.Duration) {
	time.Sleep(delayInSecs * time.Second)

	StreamCursorValueCacheMutex.Lock()
	defer StreamCursorValueCacheMutex.Unlock()
	delete(StreamCursorValueCache[meetingId], cacheKey)
}

func RemoveMeetingStreamCursorValueCache(meetingId string) {
	StreamCursorValueCacheMutex.Lock()
	defer StreamCursorValueCacheMutex.Unlock()
	delete(StreamCursorValueCache, meetingId)
}

var (
	MaxConnPerSessionToken = config.GetConfig().Server.MaxConnectionsPerSessionToken
	MaxConnGlobal          = config.GetConfig().Server.MaxConnections
)

func GetMaxConnectionsPerSessionToken() int {
	return MaxConnPerSessionToken
}

func GetMaxConnectionsGlobal() int {
	return MaxConnGlobal
}

var (
	GlobalConnectionsCount    int
	UserConnectionsCount      = make(map[string]int)
	UserConnectionsCountMutex sync.RWMutex
)

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
