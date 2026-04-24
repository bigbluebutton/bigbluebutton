package streamingserver

import (
	"bytes"
	"encoding/json"
	"sync"

	"bbb-graphql-middleware/internal/common"
)

// UsersWithAudioCount streaming handler — counts users per meeting whose
// voice.joined == true. Driven by UserJoinedVoiceConfToClientEvtMsg and
// UserLeftVoiceConfToClientEvtMsg events from akka-apps. Also decremented
// when a user leaves the meeting entirely (idempotent via the per-user set).
//
// Delivers the same shape as:
//   subscription UsersWithAudioCount {
//     user_aggregate(where: { voice: { joined: { _eq: true } } }) {
//       aggregate { count }
//     }
//   }
//
// Known limitation (v1): same locked-userlist caveat as UsersCount — the
// Hasura permission on v_user filters non-moderators in locked-userlist
// meetings. Our single-meeting-count serves all subscribers the same value;
// correct for unlocked userlists (the default) and for moderators always,
// but over-reports for non-moderators in locked-userlist meetings.

var (
	// Per-meeting set of intIds of users currently in voice. Using a set (not
	// a counter) makes the decrement path idempotent: we can safely receive
	// both UserLeftVoiceConfToClientEvtMsg and UserLeftMeetingEvtMsg for the
	// same user without double-counting.
	UsersWithAudioCache      = make(map[string]map[string]bool)
	UsersWithAudioCacheMutex sync.RWMutex
)

func GetUsersWithAudioCount(meetingId string) (int, bool) {
	UsersWithAudioCacheMutex.RLock()
	defer UsersWithAudioCacheMutex.RUnlock()
	set, ok := UsersWithAudioCache[meetingId]
	if !ok {
		return 0, false
	}
	return len(set), true
}

func RemoveMeetingUsersWithAudioCache(meetingId string) {
	UsersWithAudioCacheMutex.Lock()
	defer UsersWithAudioCacheMutex.Unlock()
	delete(UsersWithAudioCache, meetingId)
}

// addUserToVoiceSet returns the new count AND whether the set changed. The
// caller broadcasts only if changed to avoid redundant messages on duplicate
// join events (which can happen with SIP/LiveKit re-joins).
func addUserToVoiceSet(meetingId, intId string) (count int, changed bool) {
	UsersWithAudioCacheMutex.Lock()
	defer UsersWithAudioCacheMutex.Unlock()
	set, ok := UsersWithAudioCache[meetingId]
	if !ok {
		set = make(map[string]bool)
		UsersWithAudioCache[meetingId] = set
	}
	if _, already := set[intId]; already {
		return len(set), false
	}
	set[intId] = true
	return len(set), true
}

func removeUserFromVoiceSet(meetingId, intId string) (count int, changed bool) {
	UsersWithAudioCacheMutex.Lock()
	defer UsersWithAudioCacheMutex.Unlock()
	set, ok := UsersWithAudioCache[meetingId]
	if !ok {
		return 0, false
	}
	if _, present := set[intId]; !present {
		return len(set), false
	}
	delete(set, intId)
	return len(set), true
}

func buildUsersWithAudioCountPayload(count int) []byte {
	msg := map[string]any{
		"id":   QueryIdPlaceholder,
		"type": "next",
		"payload": map[string]any{
			"data": map[string]any{
				"user_aggregate": map[string]any{
					"aggregate": map[string]any{
						"count":      count,
						"__typename": "user_aggregate_fields",
					},
					"__typename": "user_aggregate",
				},
			},
		},
	}
	b, _ := json.Marshal(msg)
	return b
}

func broadcastUsersWithAudioCount(
	meetingId string,
	count int,
	browserConnectionsMutex *sync.RWMutex,
	browserConnections map[string]*common.BrowserConnection,
) {
	payload := buildUsersWithAudioCountPayload(count)

	targets := make([]*common.BrowserConnection, 0)
	browserConnectionsMutex.RLock()
	for _, bc := range browserConnections {
		if bc.MeetingId == meetingId {
			targets = append(targets, bc)
		}
	}
	browserConnectionsMutex.RUnlock()

	for _, bc := range targets {
		bc.ActiveStreamingsMutex.RLock()
		queryIds, exists := bc.ActiveStreamings["UsersWithAudioCount"]
		bc.ActiveStreamingsMutex.RUnlock()
		if !exists {
			continue
		}
		for _, qid := range queryIds {
			out := bytes.Replace(payload, QueryIdPlaceholderInBytes, []byte(qid), 1)
			bc.FromHasuraToBrowserChannel.TrySend(out)
		}
	}
}

// HandleUserJoinedVoiceConfToClientEvtMsg is dispatched from rediscli.go
// when akka-apps publishes a voice-join event for any user.
func HandleUserJoinedVoiceConfToClientEvtMsg(
	receivedMessage common.RedisMessage,
	browserConnectionsMutex *sync.RWMutex,
	browserConnections map[string]*common.BrowserConnection,
) {
	meetingId := receivedMessage.Core.Header.MeetingId
	intId, ok := receivedMessage.Core.Body["intId"].(string)
	if !ok {
		return
	}
	count, changed := addUserToVoiceSet(meetingId, intId)
	if changed {
		broadcastUsersWithAudioCount(meetingId, count, browserConnectionsMutex, browserConnections)
	}
}

// HandleUserLeftVoiceConfToClientEvtMsg is dispatched on voice-leave.
func HandleUserLeftVoiceConfToClientEvtMsg(
	receivedMessage common.RedisMessage,
	browserConnectionsMutex *sync.RWMutex,
	browserConnections map[string]*common.BrowserConnection,
) {
	meetingId := receivedMessage.Core.Header.MeetingId
	intId, ok := receivedMessage.Core.Body["intId"].(string)
	if !ok {
		return
	}
	count, changed := removeUserFromVoiceSet(meetingId, intId)
	if changed {
		broadcastUsersWithAudioCount(meetingId, count, browserConnectionsMutex, browserConnections)
	}
}

// HandleUserLeftMeetingEvtMsgForAudioCount — catches users who leave the
// meeting entirely without an explicit voice-leave. No-op if the user was
// already removed via UserLeftVoiceConfToClientEvtMsg.
func HandleUserLeftMeetingEvtMsgForAudioCount(
	receivedMessage common.RedisMessage,
	browserConnectionsMutex *sync.RWMutex,
	browserConnections map[string]*common.BrowserConnection,
) {
	meetingId := receivedMessage.Core.Header.MeetingId
	userId := receivedMessage.Core.Header.UserId
	if userId == "" {
		return
	}
	count, changed := removeUserFromVoiceSet(meetingId, userId)
	if changed {
		broadcastUsersWithAudioCount(meetingId, count, browserConnectionsMutex, browserConnections)
	}
}

// SendCurrentUsersWithAudioCount is called on subscribe.
func SendCurrentUsersWithAudioCount(browserConnection *common.BrowserConnection, queryId string) {
	count, _ := GetUsersWithAudioCount(browserConnection.MeetingId)

	msg := map[string]any{
		"id":   queryId,
		"type": "next",
		"payload": map[string]any{
			"data": map[string]any{
				"user_aggregate": map[string]any{
					"aggregate": map[string]any{
						"count":      count,
						"__typename": "user_aggregate_fields",
					},
					"__typename": "user_aggregate",
				},
			},
		},
	}
	b, _ := json.Marshal(msg)
	browserConnection.FromHasuraToBrowserChannel.SendWait(browserConnection.Context, b)
}
