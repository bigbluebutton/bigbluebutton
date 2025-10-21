package streamingserver

import (
	"bytes"
	"encoding/json"
	"maps"
	"sync"
	"time"

	"bbb-graphql-middleware/internal/common"
)

func HandleUserMutedVoiceEvtMsg(receivedMessage common.RedisMessage, browserConnectionsMutex *sync.RWMutex, browserConnections map[string]*common.BrowserConnection) {
	// voiceConf := receivedMessage.Core.Body["voiceConf"].(string)
	intId := receivedMessage.Core.Body["intId"].(string)
	// voiceUserId := receivedMessage.Core.Body["voiceUserId"].(string)
	muted := receivedMessage.Core.Body["muted"].(bool)

	now := time.Now().UTC()

	item := map[string]any{
		"userId":          intId,
		"muted":           muted,
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
	// jsonDataNext, _ := createUserMutedStateMessage(receivedMessage)

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
		queryIds, existsMutedStateStream := bc.ActiveStreamings["getUserMutedStateStream"]
		bc.ActiveStreamingsMutex.RUnlock()
		if existsMutedStateStream {
			for i := range queryIds {
				payload := bytes.Replace(jsonDataNext, QueryIdPlaceholderInBytes, []byte(queryIds[i]), 1)
				bc.FromHasuraToBrowserChannel.TrySend(payload)
			}
		}
	}

	if !muted {
		StoreMutedStatesCache(
			receivedMessage.Core.Header.MeetingId,
			receivedMessage.Core.Header.UserId,
			item,
		)
	} else {
		// new users will need to know only who is unmuted
		RemoveUserMutedStatesCache(
			receivedMessage.Core.Header.MeetingId,
			receivedMessage.Core.Header.UserId,
		)
	}
}

func SendPreviousMutedState(browserConnection *common.BrowserConnection, queryId string) {
	previousMessages, existsPreviousMessages := GetMutedStatesCache(browserConnection.MeetingId)
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
	MutedStatesCache      = make(map[string]map[string]map[string]any)
	MutedStatesCacheMutex sync.RWMutex
)

func GetMutedStatesCache(meetingId string) (map[string]map[string]any, bool) {
	MutedStatesCacheMutex.RLock()
	defer MutedStatesCacheMutex.RUnlock()
	rows, ok := MutedStatesCache[meetingId]
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

func StoreMutedStatesCache(meetingId string, userId string, row map[string]any) {
	MutedStatesCacheMutex.Lock()
	defer MutedStatesCacheMutex.Unlock()

	if _, exists := MutedStatesCache[meetingId]; !exists {
		MutedStatesCache[meetingId] = make(map[string]map[string]any)
	}
	MutedStatesCache[meetingId][userId] = row
}

func RemoveMeetingMutedStatesCache(meetingId string) {
	MutedStatesCacheMutex.Lock()
	defer MutedStatesCacheMutex.Unlock()
	delete(MutedStatesCache, meetingId)
}

func RemoveUserMutedStatesCache(meetingId string, userId string) {
	MutedStatesCacheMutex.Lock()
	defer MutedStatesCacheMutex.Unlock()

	if _, exists := MutedStatesCache[meetingId]; exists {
		delete(MutedStatesCache[meetingId], userId)
	}
}
