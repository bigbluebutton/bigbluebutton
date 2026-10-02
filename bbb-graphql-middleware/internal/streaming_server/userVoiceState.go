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
	// The speaker's role, which decides their hideUserList exemption. Read optionally: an absent
	// role reads as "", which is not MODERATOR, so the speaker gets no exemption.
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

	jsonDataNext, _ := json.Marshal(userVoiceStateResponse(item))

	meetingId := receivedMessage.Core.Header.MeetingId
	speakerRole := effectiveSpeakerRole(meetingId, userId, userRole, leftVoiceConf)

	// A user shown under the moderator exemption whose current role no longer carries it would
	// otherwise stay on screen, at their last state, for recipients that may no longer see them.
	// Those recipients are sent a row that clears that state and does not identify the user.
	exemptionWithdrawn := !strings.EqualFold(speakerRole, "MODERATOR") &&
		strings.EqualFold(cachedSpeakerRole(meetingId, userId), "MODERATOR")
	var jsonDataCleared []byte
	if exemptionWithdrawn {
		jsonDataCleared, _ = json.Marshal(userVoiceStateResponse(clearedVoiceStateItem(item)))
	}

	recipients := make([]*common.BrowserConnection, 0)
	clearedRecipients := make([]*common.BrowserConnection, 0)
	browserConnectionsMutex.RLock()
	for _, bc := range browserConnections {
		recipient := snapshotStreamingRecipient(bc)
		if voiceStateVisibleTo(recipient, meetingId, userId, speakerRole) {
			recipients = append(recipients, bc)
		} else if exemptionWithdrawn && voiceStateVisibleTo(recipient, meetingId, userId, "MODERATOR") {
			clearedRecipients = append(clearedRecipients, bc)
		}
	}
	browserConnectionsMutex.RUnlock()

	sendUserVoiceState(recipients, jsonDataNext)
	sendUserVoiceState(clearedRecipients, jsonDataCleared)

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

// userVoiceStateResponse wraps one voice state row in the frame sent to subscribers. The id is a
// placeholder that sendUserVoiceState replaces with each subscription's query id.
func userVoiceStateResponse(item map[string]any) map[string]any {
	return map[string]any{
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
}

// clearedVoiceStateItem is a row that ends a user's talking and unmuted state on the client. It
// keeps the user id the recipient already holds and the user's current role, and carries no name or
// other identifying detail.
func clearedVoiceStateItem(item map[string]any) map[string]any {
	var role string
	if user, ok := item["user"].(map[string]any); ok {
		role, _ = user["role"].(string)
	}

	return map[string]any{
		"userId":        item["userId"],
		"voiceUserId":   "",
		"muted":         true,
		"talking":       false,
		"leftVoiceConf": item["leftVoiceConf"],
		"user": map[string]any{
			"role":         role,
			"color":        "",
			"name":         "",
			"speechLocale": "",
			"__typename":   "user_ref",
		},
		"voiceActivityAt": item["voiceActivityAt"],
		"__typename":      "user_voice_activity_stream",
	}
}

// sendUserVoiceState delivers a frame to every voice state subscription of each connection.
func sendUserVoiceState(browserConnections []*common.BrowserConnection, jsonData []byte) {
	for _, bc := range browserConnections {
		bc.ActiveStreamingsMutex.RLock()
		queryIds, existsUserVoiceStatestream := bc.ActiveStreamings[config.OpUserVoiceStateStream]
		bc.ActiveStreamingsMutex.RUnlock()
		if existsUserVoiceStatestream {
			for i := range queryIds {
				payload := bytes.Replace(jsonData, QueryIdPlaceholderInBytes, []byte(queryIds[i]), 1)
				bc.FromHasuraToBrowserChannel.TrySend(payload)
			}
		}
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

// effectiveSpeakerRole is the role the gate should apply to a voice state event.
//
// akka-apps reports VIEWER on the row that clears a user's voice state when it no longer holds a
// voice record for them, so a clearing event alone cannot be trusted to identify a moderator. For
// those events the cached row, which carries the role the user last spoke with, decides: a
// moderator keeps it, so everyone who was shown their indicator is also sent the row that clears
// it. Any other event carries the user's current role, which stands even where the cached row
// differs, as it does right after a role change.
func effectiveSpeakerRole(meetingId, speakerUserId, eventRole string, clearing bool) string {
	if !clearing || strings.EqualFold(eventRole, "MODERATOR") {
		return eventRole
	}

	if cachedRole := cachedSpeakerRole(meetingId, speakerUserId); strings.EqualFold(cachedRole, "MODERATOR") {
		return cachedRole
	}

	return eventRole
}

// cachedSpeakerRole is the role on a user's cached voice state row, or "" when none is cached.
func cachedSpeakerRole(meetingId, speakerUserId string) string {
	UserVoiceStatesCacheMutex.RLock()
	row, ok := UserVoiceStatesCache[meetingId][speakerUserId]
	UserVoiceStatesCacheMutex.RUnlock()
	if !ok {
		return ""
	}

	_, role := cachedVoiceStateSpeaker(row)

	return role
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
