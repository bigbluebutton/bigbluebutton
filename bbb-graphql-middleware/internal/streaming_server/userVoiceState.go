package streamingserver

import (
	"bytes"
	"encoding/json"
	"maps"
	"sync"
	"time"

	"bbb-graphql-middleware/internal/common"
)

func HandleUserVoiceStateEvtMsg(receivedMessage common.RedisMessage, browserConnectionsMutex *sync.RWMutex, browserConnections map[string]*common.BrowserConnection) {
	userId := receivedMessage.Core.Body["userId"].(string)
	voiceUserId := receivedMessage.Core.Body["voiceUserId"].(string)
	userName := receivedMessage.Core.Body["userName"].(string)
	userColor := receivedMessage.Core.Body["userColor"].(string)
	userSpeechLocale := receivedMessage.Core.Body["userSpeechLocale"].(string)
	talking := receivedMessage.Core.Body["talking"].(bool)
	muted := receivedMessage.Core.Body["muted"].(bool)

	now := time.Now().UTC()

	item := map[string]any{
		"userId":      userId,
		"voiceUserId": voiceUserId,
		"muted":       muted,
		"talking":     talking,
		"user": map[string]any{
			"color":        userColor,
			"name":         userName,
			"speechLocale": userSpeechLocale,
			"__typename":   "user_ref",
		},
		"voiceActivityAt": now.Format("2006-01-02T15:04:05.000Z"),
		"__typename":      "user_voice_activity_stream",
	}

	browserResponseData := map[string]any{
		"id":   QueryIdPlaceholder,
		"type": "next",
		"payload": map[string]any{
			"data": map[string]any{
				"user_voice_activity_stream": []any{
					item,
				},
			},
		},
	}
	jsonDataNext, _ := json.Marshal(browserResponseData)

	browserConnectionsToSendData := make([]*common.BrowserConnection, 0)
	browserConnectionsMutex.RLock()
	for _, bc := range browserConnections {
		if bc.MeetingId == receivedMessage.Core.Header.MeetingId {
			browserConnectionsToSendData = append(browserConnectionsToSendData, bc)
		}
	}
	browserConnectionsMutex.RUnlock()

	for _, bc := range browserConnectionsToSendData {
		bc.ActiveStreamingsMutex.RLock()
		queryIds, existsUserVoiceStatestream := bc.ActiveStreamings["getUserVoiceStateStream"]
		bc.ActiveStreamingsMutex.RUnlock()
		if existsUserVoiceStatestream {
			for i := range queryIds {
				payload := bytes.Replace(jsonDataNext, QueryIdPlaceholderInBytes, []byte(queryIds[i]), 1)
				bc.FromHasuraToBrowserChannel.TrySend(payload)
			}
		}
	}

	if talking || !muted {
		StoreUserVoiceStatesCache(
			receivedMessage.Core.Header.MeetingId,
			receivedMessage.Core.Header.UserId,
			item,
		)
	} else {
		// new users will need to know only who is talking
		RemoveUserUserVoiceStatesCache(
			receivedMessage.Core.Header.MeetingId,
			receivedMessage.Core.Header.UserId,
		)
	}
}

func SendPreviousUserVoiceState(browserConnection *common.BrowserConnection, queryId string) {
	previousMessages, existsPreviousMessages := GetUserVoiceStatesCache(browserConnection.MeetingId)
	if existsPreviousMessages {
		items := make([]any, 0, len(previousMessages))
		for _, message := range previousMessages {
			items = append(items, message)
		}

		browserResponseData := map[string]any{
			"id":   queryId,
			"type": "next",
			"payload": map[string]any{
				"data": map[string]any{
					"user_voice_activity_stream": items,
				},
			},
		}
		jsonDataNext, _ := json.Marshal(browserResponseData)
		browserConnection.FromHasuraToBrowserChannel.SendWait(browserConnection.Context, jsonDataNext)
	}
}

// the cache will use meetingId + userId as keys, as it needs to store only the last for each user
var (
	UserVoiceStatesCache      = make(map[string]map[string]map[string]any)
	UserVoiceStatesCacheMutex sync.RWMutex
)

func GetUserVoiceStatesCache(meetingId string) (map[string]map[string]any, bool) {
	UserVoiceStatesCacheMutex.RLock()
	defer UserVoiceStatesCacheMutex.RUnlock()
	rows, ok := UserVoiceStatesCache[meetingId]
	if !ok {
		return nil, false
	}
	// Deep copy the map
	copyRows := make(map[string]map[string]any, len(rows))
	for userId, row := range rows {
		newRow := make(map[string]any, len(row))
		maps.Copy(newRow, row)
		copyRows[userId] = newRow
	}

	return copyRows, true
}

func StoreUserVoiceStatesCache(meetingId string, userId string, row map[string]any) {
	UserVoiceStatesCacheMutex.Lock()
	defer UserVoiceStatesCacheMutex.Unlock()

	if _, exists := UserVoiceStatesCache[meetingId]; !exists {
		UserVoiceStatesCache[meetingId] = make(map[string]map[string]any)
	}
	UserVoiceStatesCache[meetingId][userId] = row
}

func RemoveMeetingUserVoiceStatesCache(meetingId string) {
	UserVoiceStatesCacheMutex.Lock()
	defer UserVoiceStatesCacheMutex.Unlock()
	delete(UserVoiceStatesCache, meetingId)
}

func RemoveUserUserVoiceStatesCache(meetingId string, userId string) {
	UserVoiceStatesCacheMutex.Lock()
	defer UserVoiceStatesCacheMutex.Unlock()

	if _, exists := UserVoiceStatesCache[meetingId]; exists {
		delete(UserVoiceStatesCache[meetingId], userId)
	}
}
