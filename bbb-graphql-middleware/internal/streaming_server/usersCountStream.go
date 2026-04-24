package streamingserver

import (
	"bytes"
	"encoding/json"
	"sync"

	"bbb-graphql-middleware/internal/common"
)

// UsersCount streaming handler — maintains a per-meeting count of users in
// the `user` view, driven by UserJoinedMeetingEvtMsg / UserLeftMeetingEvtMsg
// events from akka-apps. Delivers the same shape as Hasura's
//   subscription UsersCount { user_aggregate { aggregate { count } } }
// without reaching Hasura or Postgres on every change.
//
// Known limitation (v1): the Hasura permission on `v_user` returns a
// different row set for non-moderators in meetings with a locked userlist
// (see public_v_user.yaml select_permissions.filter). This handler caches a
// single meeting-wide count and serves it to all subscribers regardless of
// role, which is correct for meetings where the userlist is unlocked
// (common default) but over-reports for non-moderators in locked-userlist
// meetings. A future refinement could maintain two counts per meeting
// (all-users / non-moderator-visible) and pick based on the subscriber's
// session variables.

var (
	UsersCountCache      = make(map[string]int)
	UsersCountCacheMutex sync.RWMutex
)

// GetUsersCount returns the cached count and whether the meeting has been
// primed. Callers should treat (0, false) as "unknown — deliver 0 for now,
// next event will correct it."
func GetUsersCount(meetingId string) (int, bool) {
	UsersCountCacheMutex.RLock()
	defer UsersCountCacheMutex.RUnlock()
	v, ok := UsersCountCache[meetingId]
	return v, ok
}

// SetUsersCount overwrites the cached count. Used by tests + the
// eventual bootstrap path that primes the cache from Hasura on first subscribe.
func SetUsersCount(meetingId string, count int) {
	UsersCountCacheMutex.Lock()
	defer UsersCountCacheMutex.Unlock()
	UsersCountCache[meetingId] = count
}

func RemoveMeetingUsersCountCache(meetingId string) {
	UsersCountCacheMutex.Lock()
	defer UsersCountCacheMutex.Unlock()
	delete(UsersCountCache, meetingId)
}

// incrementUsersCount / decrementUsersCount keep the mutation + read under
// one lock so concurrent joins/leaves don't race.
func incrementUsersCount(meetingId string) int {
	UsersCountCacheMutex.Lock()
	defer UsersCountCacheMutex.Unlock()
	UsersCountCache[meetingId]++
	return UsersCountCache[meetingId]
}

func decrementUsersCount(meetingId string) int {
	UsersCountCacheMutex.Lock()
	defer UsersCountCacheMutex.Unlock()
	if UsersCountCache[meetingId] > 0 {
		UsersCountCache[meetingId]--
	}
	return UsersCountCache[meetingId]
}

// buildUsersCountPayload returns the Apollo-compatible "next" message with
// QueryIdPlaceholder for later per-subscription substitution.
func buildUsersCountPayload(count int) []byte {
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

// broadcastUsersCount fans the current count out to every connection in the
// meeting that has an active `UsersCount` subscription. Collect under the
// read lock, send outside it — same pattern as userVoiceState.go.
func broadcastUsersCount(
	meetingId string,
	count int,
	browserConnectionsMutex *sync.RWMutex,
	browserConnections map[string]*common.BrowserConnection,
) {
	payload := buildUsersCountPayload(count)

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
		queryIds, exists := bc.ActiveStreamings["UsersCount"]
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

// HandleUserJoinedMeetingEvtMsg is the Redis event entry point. Incremented
// count is broadcast to all active `UsersCount` subscribers in the meeting.
func HandleUserJoinedMeetingEvtMsg(
	receivedMessage common.RedisMessage,
	browserConnectionsMutex *sync.RWMutex,
	browserConnections map[string]*common.BrowserConnection,
) {
	meetingId := receivedMessage.Core.Header.MeetingId
	count := incrementUsersCount(meetingId)
	broadcastUsersCount(meetingId, count, browserConnectionsMutex, browserConnections)
}

// HandleUserLeftMeetingEvtMsgForCount is the count-side handler for
// UserLeftMeetingEvtMsg. The existing rediscli dispatch already handles the
// cursor-cache cleanup for this event; we add a second dispatch for counts.
func HandleUserLeftMeetingEvtMsgForCount(
	receivedMessage common.RedisMessage,
	browserConnectionsMutex *sync.RWMutex,
	browserConnections map[string]*common.BrowserConnection,
) {
	meetingId := receivedMessage.Core.Header.MeetingId
	count := decrementUsersCount(meetingId)
	broadcastUsersCount(meetingId, count, browserConnectionsMutex, browserConnections)
}

// SendCurrentUsersCount is called on subscribe so the new subscriber receives
// the current value immediately instead of waiting for the next join/leave.
// If the cache has no entry yet (e.g., middleware restarted after meeting
// started), sends 0. The next event will correct it. A future refinement is
// to prime the cache by querying Hasura once on first-subscribe-per-meeting.
func SendCurrentUsersCount(browserConnection *common.BrowserConnection, queryId string) {
	count, _ := GetUsersCount(browserConnection.MeetingId)

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
