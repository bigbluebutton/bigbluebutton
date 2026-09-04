package streamingserver

import (
	"bytes"
	"encoding/json"
	"maps"
	"strings"
	"sync"
	"time"

	"bbb-graphql-middleware/internal/common"
)

const moderatorRole = "MODERATOR"

// voiceStateRecipient is an immutable snapshot of the BrowserConnection fields the hideUserList
// check needs. Taking a snapshot under the connection lock keeps the check itself pure (and so
// unit-testable) and avoids retaining a reference to BBBWebSessionVariables, which
// refreshUserSessionVariables replaces wholesale under the write lock.
type voiceStateRecipient struct {
	MeetingId          string
	UserId             string
	CurrentlyInMeeting bool
	SessionVarsStale   bool
	UserListNotLocked  string // BBBWebSessionVariables["x-hasura-userlistnotlockedinmeeting"]
}

func snapshotVoiceStateRecipient(bc *common.BrowserConnection) voiceStateRecipient {
	bc.RLock()
	defer bc.RUnlock()

	return voiceStateRecipient{
		MeetingId:          bc.MeetingId,
		UserId:             bc.UserId,
		CurrentlyInMeeting: bc.CurrentlyInMeeting,
		SessionVarsStale:   bc.SessionVariablesStale,
		UserListNotLocked:  bc.BBBWebSessionVariables["x-hasura-userlistnotlockedinmeeting"],
	}
}

// canReceiveUserVoiceState mirrors the Hasura select permission on public.v_user_voice_activity
// (bbb-graphql-server/metadata/databases/BigBlueButton/tables/public_v_user_voice_activity.yaml):
//
//	meetingId = X-Hasura-MeetingId AND (
//	    speaker.isModerator OR
//	    userId = X-Hasura-UserId OR
//	    meetingId = X-Hasura-UserListNotLockedInMeeting )
//
// This subscription is served by the middleware rather than by Hasura, so the permission is
// applied here to keep the two in step. Two conditions Hasura enforces for free have to be
// spelled out:
//
//   - the bbb_client_not_in_meeting role has no permission on this table, so a connection that is
//     not currently in the meeting (guest lobby, ejected, left) receives nothing;
//   - session variables are refreshed asynchronously, so a refresh in flight or a failed refresh
//     means the lock state is unknown and must not be trusted.
//
// Every unknown fails closed.
func canReceiveUserVoiceState(r voiceStateRecipient, meetingId, speakerUserId, speakerRole string) bool {
	// An empty meetingId matches nothing: it is not yet known before connection_init, and two
	// empty strings must never compare equal here.
	if meetingId == "" || r.MeetingId != meetingId {
		return false
	}

	if !r.CurrentlyInMeeting {
		return false
	}

	// A user always sees their own voice state.
	if r.UserId != "" && r.UserId == speakerUserId {
		return true
	}

	// Moderators are never hidden by hideUserList.
	if strings.EqualFold(speakerRole, moderatorRole) {
		return true
	}

	// The recipient is not subject to hideUserList. Unknown while a refresh is pending.
	if r.SessionVarsStale {
		return false
	}

	return r.UserListNotLocked != "" && r.UserListNotLocked == meetingId
}

// voiceStateRowVisibleTo applies the same check to a cached row, reading the speaker's identity and
// role out of the row itself. Malformed rows are treated as not visible rather than panicking.
func voiceStateRowVisibleTo(row map[string]any, r voiceStateRecipient, meetingId string) bool {
	speakerUserId, _ := row["userId"].(string)

	speakerRole := ""
	if user, ok := row["user"].(map[string]any); ok {
		speakerRole, _ = user["role"].(string)
	}

	return canReceiveUserVoiceState(r, meetingId, speakerUserId, speakerRole)
}

// cachedSpeakerIsModerator reports whether the last cached voice state for this speaker was a
// moderator's. Three akka-apps call sites emit the "left voice conf" row with no VoiceUserState,
// which forces userRole to VIEWER; without this fallback a moderator's clear-row would be filtered
// away from locked viewers and their talking indicator would linger until the client's timeout.
// The cache only ever holds users who were audible, so a speaker with no entry has no indicator to
// strand, and a hidden viewer is never a moderator in either source.
func cachedSpeakerIsModerator(meetingId string, speakerUserId string) bool {
	UserVoiceStatesCacheMutex.RLock()
	defer UserVoiceStatesCacheMutex.RUnlock()

	row, ok := UserVoiceStatesCache[meetingId][speakerUserId]
	if !ok {
		return false
	}

	user, ok := row["user"].(map[string]any)
	if !ok {
		return false
	}

	role, _ := user["role"].(string)

	return strings.EqualFold(role, moderatorRole)
}

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
	// Recover the speaker's role from the cache when the event itself reports a viewer, so that a
	// moderator's "left voice conf" row (emitted without a VoiceUserState) still reaches the
	// locked viewers that were shown their talking indicator.
	speakerIsModerator := strings.EqualFold(userRole, moderatorRole) || cachedSpeakerIsModerator(meetingId, userId)
	effectiveSpeakerRole := userRole
	if speakerIsModerator {
		effectiveSpeakerRole = moderatorRole
	}

	browserConnectionsToSendData := make([]*common.BrowserConnection, 0)
	browserConnectionsMutex.RLock()
	for _, bc := range browserConnections {
		// check for lock settings "Hide user list"
		if canReceiveUserVoiceState(snapshotVoiceStateRecipient(bc), meetingId, userId, effectiveSpeakerRole) {
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
	recipient := snapshotVoiceStateRecipient(browserConnection)

	previousMessages, existsPreviousMessages := GetUserVoiceStatesCache(recipient.MeetingId)
	if !existsPreviousMessages {
		return
	}

	// The replay path applies the same gate as the live broadcast: a subscriber is replayed only
	// the rows they would have been sent live.
	items := make([]any, 0, len(previousMessages))
	for _, message := range previousMessages {
		if voiceStateRowVisibleTo(message, recipient, recipient.MeetingId) {
			items = append(items, message)
		}
	}

	if len(items) == 0 {
		return
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
