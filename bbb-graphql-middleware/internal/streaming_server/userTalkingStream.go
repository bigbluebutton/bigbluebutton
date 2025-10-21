package streamingserver

import (
	"bytes"
	"encoding/json"
	"maps"
	"sync"
	"time"

	"bbb-graphql-middleware/internal/common"
)

func HandleUserTalkingVoiceEvtMsg(receivedMessage common.RedisMessage, browserConnectionsMutex *sync.RWMutex, browserConnections map[string]*common.BrowserConnection) {
	// voiceConf := receivedMessage.Core.Body["voiceConf"].(string)
	intId := receivedMessage.Core.Body["intId"].(string)
	// voiceUserId := receivedMessage.Core.Body["voiceUserId"].(string)
	talking := receivedMessage.Core.Body["talking"].(bool)

	now := time.Now().UTC()

	item := map[string]any{
		"userId":          intId,
		"talking":         talking,
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
	// jsonDataNext, _ := createUserTalkingStateMessage(receivedMessage)

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
		queryIds, existsTalkingStateStream := bc.ActiveStreamings["getUserTalkingStateStream"]
		bc.ActiveStreamingsMutex.RUnlock()
		if existsTalkingStateStream {
			for i := range queryIds {
				payload := bytes.Replace(jsonDataNext, QueryIdPlaceholderInBytes, []byte(queryIds[i]), 1)
				bc.FromHasuraToBrowserChannel.TrySend(payload)
			}
		}
	}

	if talking {
		StoreTalkingStatesCache(
			receivedMessage.Core.Header.MeetingId,
			receivedMessage.Core.Header.UserId,
			item,
		)
	} else {
		// new users will need to know only who is talking
		RemoveUserTalkingStatesCache(
			receivedMessage.Core.Header.MeetingId,
			receivedMessage.Core.Header.UserId,
		)
	}
}

func SendPreviousTalkingState(browserConnection *common.BrowserConnection, queryId string) {
	previousMessages, existsPreviousMessages := GetTalkingStatesCache(browserConnection.MeetingId)
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
	TalkingStatesCache      = make(map[string]map[string]map[string]any)
	TalkingStatesCacheMutex sync.RWMutex
)

func GetTalkingStatesCache(meetingId string) (map[string]map[string]any, bool) {
	TalkingStatesCacheMutex.RLock()
	defer TalkingStatesCacheMutex.RUnlock()
	rows, ok := TalkingStatesCache[meetingId]
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

func StoreTalkingStatesCache(meetingId string, userId string, row map[string]any) {
	TalkingStatesCacheMutex.Lock()
	defer TalkingStatesCacheMutex.Unlock()

	if _, exists := TalkingStatesCache[meetingId]; !exists {
		TalkingStatesCache[meetingId] = make(map[string]map[string]any)
	}
	TalkingStatesCache[meetingId][userId] = row
}

func RemoveMeetingTalkingStatesCache(meetingId string) {
	TalkingStatesCacheMutex.Lock()
	defer TalkingStatesCacheMutex.Unlock()
	delete(TalkingStatesCache, meetingId)
}

func RemoveUserTalkingStatesCache(meetingId string, userId string) {
	TalkingStatesCacheMutex.Lock()
	defer TalkingStatesCacheMutex.Unlock()

	if _, exists := TalkingStatesCache[meetingId]; exists {
		delete(TalkingStatesCache[meetingId], userId)
	}
}
