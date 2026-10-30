package streamingserver

import (
	"bytes"
	"encoding/json"
	"maps"
	"sync"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
)

var (
	QueryIdPlaceholder        = "--------------QUERY-ID--------------" // 36 chars
	QueryIdPlaceholderInBytes = []byte(QueryIdPlaceholder)
)

// cursorIsHiddenForLockedViewers reports whether this cursor event must be withheld
// from locked viewers. The lock state travels with the event (instead of being frozen
// into each receiver's session), so a hideViewersCursor change applies to the very
// next event without refreshing any session. When the field is absent (event produced
// by an older akka-apps) it falls back to hiding every viewer cursor from locked
// viewers, which is the privacy-safe direction.
func cursorIsHiddenForLockedViewers(eventBody map[string]interface{}, cursorIsFromViewer bool) bool {
	if hiddenForLockedViewers, hasLockStateInEvent := eventBody["hiddenForLockedViewers"].(bool); hasLockStateInEvent {
		return hiddenForLockedViewers
	}
	return cursorIsFromViewer
}

func HandleSendCursorPositionEvtMsg(receivedMessage common.RedisMessage, browserConnectionsMutex *sync.RWMutex, browserConnections map[string]*common.BrowserConnection) {
	receivedCursorIsFromViewer := receivedMessage.Core.Body["userIsViewer"].(bool)
	xPercent := receivedMessage.Core.Body["xPercent"].(float64)
	yPercent := receivedMessage.Core.Body["yPercent"].(float64)
	cursorHiddenForLockedViewers := cursorIsHiddenForLockedViewers(receivedMessage.Core.Body, receivedCursorIsFromViewer)

	item := map[string]any{
		"xPercent":   xPercent,
		"yPercent":   yPercent,
		"userId":     receivedMessage.Core.Header.UserId,
		"__typename": "pres_page_cursor",
	}

	browserResponseData := map[string]any{
		"id":   QueryIdPlaceholder,
		"type": "next",
		"payload": map[string]any{
			"data": map[string]any{
				"pres_page_cursor_stream": []any{
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
		if cursorVisibleTo(snapshotStreamingRecipient(bc), meetingId, cursorHiddenForLockedViewers) {
			browserConnectionsToSendData = append(browserConnectionsToSendData, bc)
		}
	}
	browserConnectionsMutex.RUnlock()

	for _, bc := range browserConnectionsToSendData {
		bc.ActiveStreamingsMutex.RLock()
		queryIds, existsCursorStream := bc.ActiveStreamings[config.OpCursorCoordinatesStream]
		bc.ActiveStreamingsMutex.RUnlock()
		if existsCursorStream {
			for i := range queryIds {
				payload := bytes.Replace(jsonDataNext, QueryIdPlaceholderInBytes, []byte(queryIds[i]), 1)
				bc.FromHasuraToBrowserChannel.TrySend(payload)
			}
		}
	}

	StoreCursorsCache(
		receivedMessage.Core.Header.MeetingId,
		receivedMessage.Core.Header.UserId,
		item,
		receivedCursorIsFromViewer,
	)
}

// cursorVisibleTo decides whether one connection may see a cursor update.
//
// hiddenForLockedViewers is the "see other viewers' cursors" lock as it applies to this cursor:
// true only for a viewer's cursor while hideViewersCursor is on. The lock state travels with the
// event, so only the recipient's side - whether it is a locked viewer - comes from the session.
//
// That side is read as X-Hasura-NotLockedInMeeting, which holds the meeting id only for a user who
// is not locked and is absent for a connection that is not in the meeting. Comparing it against a
// non-empty meeting id makes "unknown" read as "locked", never as "unlocked". Membership and a
// settled refresh are checked first, so the comparison is only reached once its input is
// meaningful.
func cursorVisibleTo(r streamingRecipient, meetingId string, hiddenForLockedViewers bool) bool {
	if !r.inMeeting(meetingId) {
		return false
	}

	if !hiddenForLockedViewers {
		return true
	}

	if !r.sessionVarsSettled() {
		return false
	}

	return r.sessionVar("x-hasura-notlockedinmeeting") == meetingId
}

// SendPreviousCursorPosition replays the last known cursor of each user to a new subscriber, and
// reports whether a frame was sent.
//
// False means the recipient is not currently a member of the meeting, which is the caller's signal
// to try again once membership arrives. A permitted recipient always receives a frame, empty if
// nothing survives filtering, since the client has no other way to tell "nothing to show" from
// "still waiting".
func SendPreviousCursorPosition(browserConnection *common.BrowserConnection, queryId string) bool {
	recipient := snapshotStreamingRecipient(browserConnection)
	if !recipient.inMeeting(recipient.MeetingId) {
		return false
	}

	// The replay is subject to the same rules as the live path; subscribing is not a way around
	// them. Each cached row records whether its cursor came from a viewer, so the live gate applies
	// per row rather than to the replay as a whole, against the meeting's current lock state rather
	// than the one the row was produced under.
	hideViewersCursor := meetingHidesViewersCursor(recipient.MeetingId)
	previousMessages, _ := GetCursorsCache(recipient.MeetingId)
	items := make([]any, 0, len(previousMessages))
	for _, cached := range previousMessages {
		if !cursorVisibleTo(recipient, recipient.MeetingId, cached.FromViewer && hideViewersCursor) {
			continue
		}
		items = append(items, cached.Row)
	}

	browserResponseData := map[string]any{
		"id":   queryId,
		"type": "next",
		"payload": map[string]any{
			"data": map[string]any{
				"pres_page_cursor_stream": items,
			},
		},
	}
	jsonDataNext, _ := json.Marshal(browserResponseData)
	browserConnection.FromHasuraToBrowserChannel.SendWait(browserConnection.Context, jsonDataNext)

	return true
}

// cachedCursor holds the row exactly as it goes on the wire, and the bookkeeping the replay needs
// beside it rather than inside it.
//
// Row is marshalled verbatim into the payload, and the client's document for this subscription is
// a fixed contract, so anything the recipient must not see has to stay out of the map.
type cachedCursor struct {
	Row        map[string]any
	FromViewer bool
}

// the cache will use meetingId + userId as keys, as it needs to store only the last position for each user
var (
	CursorsCache      = make(map[string]map[string]cachedCursor)
	CursorsCacheMutex sync.RWMutex
)

func GetCursorsCache(meetingId string) (map[string]cachedCursor, bool) {
	CursorsCacheMutex.RLock()
	defer CursorsCacheMutex.RUnlock()
	rows, ok := CursorsCache[meetingId]
	if !ok {
		return nil, false
	}
	// Deep copy the map
	copyRows := make(map[string]cachedCursor, len(rows))
	for userId, cached := range rows {
		newRow := make(map[string]any, len(cached.Row))
		maps.Copy(newRow, cached.Row)
		copyRows[userId] = cachedCursor{Row: newRow, FromViewer: cached.FromViewer}
	}

	return copyRows, true
}

func StoreCursorsCache(meetingId string, userId string, row map[string]any, fromViewer bool) {
	CursorsCacheMutex.Lock()
	defer CursorsCacheMutex.Unlock()

	if _, exists := CursorsCache[meetingId]; !exists {
		CursorsCache[meetingId] = make(map[string]cachedCursor)
	}
	CursorsCache[meetingId][userId] = cachedCursor{Row: row, FromViewer: fromViewer}
}

func RemoveMeetingCursorsCache(meetingId string) {
	CursorsCacheMutex.Lock()
	defer CursorsCacheMutex.Unlock()
	delete(CursorsCache, meetingId)
}

func RemoveUserCursorsCache(meetingId string, userId string) {
	CursorsCacheMutex.Lock()
	defer CursorsCacheMutex.Unlock()

	if _, exists := CursorsCache[meetingId]; exists {
		delete(CursorsCache[meetingId], userId)
	}
}
