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

func HandleSendCursorPositionEvtMsg(receivedMessage common.RedisMessage, browserConnectionsMutex *sync.RWMutex, browserConnections map[string]*common.BrowserConnection) {
	receivedCursorIsFromViewer := receivedMessage.Core.Body["userIsViewer"].(bool)
	xPercent := receivedMessage.Core.Body["xPercent"].(float64)
	yPercent := receivedMessage.Core.Body["yPercent"].(float64)

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
		if cursorVisibleTo(snapshotStreamingRecipient(bc), meetingId, receivedCursorIsFromViewer) {
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
// The "see other viewers' cursors" lock is expressed by X-Hasura-CursorLockedUserId, which the
// not-in-meeting branch of the session-variables hook omits entirely. An empty value therefore
// means "unknown", not "unlocked". Membership and a settled refresh are checked first, so the
// lock comparison is only reached once its input is meaningful.
func cursorVisibleTo(r streamingRecipient, meetingId string, cursorIsFromViewer bool) bool {
	if !r.inMeeting(meetingId) {
		return false
	}

	if !cursorIsFromViewer {
		return true // moderator/presenter cursors are not covered by the lock
	}

	if !r.sessionVarsSettled() {
		return false
	}

	viewersCursorLocked := r.sessionVar("x-hasura-cursorlockeduserid") == r.UserId

	return !viewersCursorLocked
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
	// per row rather than to the replay as a whole.
	previousMessages, _ := GetCursorsCache(recipient.MeetingId)
	items := make([]any, 0, len(previousMessages))
	for _, cached := range previousMessages {
		if !cursorVisibleTo(recipient, recipient.MeetingId, cached.FromViewer) {
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
