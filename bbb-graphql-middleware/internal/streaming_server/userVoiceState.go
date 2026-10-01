package streamingserver

import (
	"bytes"
	"encoding/json"
	"maps"
	"strings"
	"sync"
	"time"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
)

func HandleUserVoiceStateEvtMsg(receivedMessage common.RedisMessage, browserConnectionsMutex *sync.RWMutex, browserConnections map[string]*common.BrowserConnection) {
	userId := receivedMessage.Core.Body["userId"].(string)
	voiceUserId := receivedMessage.Core.Body["voiceUserId"].(string)
	// Not sent by akka-apps on 3.0. Absent reads as "", which is not MODERATOR, so the speaker
	// gets no hideUserList exemption.
	userRole, _ := receivedMessage.Core.Body["userRole"].(string)
	userName := receivedMessage.Core.Body["userName"].(string)
	userColor := receivedMessage.Core.Body["userColor"].(string)
	userSpeechLocale := receivedMessage.Core.Body["userSpeechLocale"].(string)
	talking := receivedMessage.Core.Body["talking"].(bool)
	muted := receivedMessage.Core.Body["muted"].(bool)
	leftVoiceConf := receivedMessage.Core.Body["leftVoiceConf"].(bool)

	now := time.Now().UTC()

	item := map[string]any{
		"userId":        userId,
		"voiceUserId":   voiceUserId,
		"muted":         muted,
		"talking":       talking,
		"leftVoiceConf": leftVoiceConf,
		"user": map[string]any{
			"role":         userRole,
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

	meetingId := receivedMessage.Core.Header.MeetingId

	browserConnectionsToSendData := make([]*common.BrowserConnection, 0)
	browserConnectionsMutex.RLock()
	for _, bc := range browserConnections {
		if voiceStateVisibleTo(snapshotStreamingRecipient(bc), meetingId, userId, userRole) {
			browserConnectionsToSendData = append(browserConnectionsToSendData, bc)
		}
	}
	browserConnectionsMutex.RUnlock()

	for _, bc := range browserConnectionsToSendData {
		bc.ActiveStreamingsMutex.RLock()
		queryIds, existsUserVoiceStatestream := bc.ActiveStreamings[config.OpUserVoiceStateStream]
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

// voiceStateVisibleTo decides whether one connection may see another user's voice state.
//
// The payload carries the speaker's name, so it is subject to the hideUserList lock. This
// subscription is answered here rather than forwarded to Hasura, so the view permissions that
// would normally govern that name do not apply and the equivalent rule is enforced here.
//
// The rule mirrors the one Hasura puts on v_user, which is where the indicator's name and role
// would otherwise come from:
//
//	meetingId = X-Hasura-MeetingId AND (isModerator OR meetingId = X-Hasura-UserListNotLockedInMeeting)
//
// plus the recipient's own row, which the client needs for its own mute/talking state and which
// Hasura serves from v_user_current rather than v_user.
func voiceStateVisibleTo(r streamingRecipient, meetingId, speakerUserId, speakerRole string) bool {
	if !r.inMeeting(meetingId) {
		return false
	}

	// Moderators are exempt from hideUserList, so their voice state goes to everyone.
	if strings.EqualFold(speakerRole, "MODERATOR") {
		return true
	}

	// A user always sees their own state, locked or not.
	if speakerUserId != "" && speakerUserId == r.UserId {
		return true
	}

	if !r.sessionVarsSettled() {
		return false
	}

	// Holds the meeting id while the user list is unlocked and is cleared when hideUserList is
	// on. It is absent entirely for a not-in-meeting connection, so an empty value means
	// "unknown" and must not be read as "unlocked": compare for equality against a non-empty
	// meetingId rather than testing for emptiness. inMeeting above guarantees non-empty.
	return r.sessionVar("x-hasura-userlistnotlockedinmeeting") == meetingId
}

// cachedVoiceStateSpeaker pulls the speaker identity out of a cached row so the replay path can
// apply the same gate as the live path. A row missing either field falls through to the lock
// check rather than being treated as a moderator or as the recipient themselves.
func cachedVoiceStateSpeaker(row map[string]any) (string, string) {
	userId, _ := row["userId"].(string)

	var role string
	if user, ok := row["user"].(map[string]any); ok {
		role, _ = user["role"].(string)
	}

	return userId, role
}

// SendPreviousUserVoiceState replays the cached voice state of each user to a new subscriber, and
// reports whether a frame was sent.
//
// False means the recipient is not currently a member of the meeting, which is the caller's signal
// to try again once membership arrives. A permitted recipient always receives a frame, empty if
// nothing survives filtering: the client clears its loading state on the first frame and suppresses
// the talking indicator until then, so withholding one disables the feature rather than scoping it.
func SendPreviousUserVoiceState(browserConnection *common.BrowserConnection, queryId string) bool {
	recipient := snapshotStreamingRecipient(browserConnection)
	if !recipient.inMeeting(recipient.MeetingId) {
		return false
	}

	// Filtered per row: each row records whose voice state it is, so the live gate applies to it
	// exactly.
	previousMessages, _ := GetUserVoiceStatesCache(recipient.MeetingId)
	items := make([]any, 0, len(previousMessages))
	for _, message := range previousMessages {
		speakerUserId, speakerRole := cachedVoiceStateSpeaker(message)
		if !voiceStateVisibleTo(recipient, recipient.MeetingId, speakerUserId, speakerRole) {
			continue
		}
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

	return true
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
