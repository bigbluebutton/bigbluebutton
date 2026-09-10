package streamingserver

import (
	"bytes"
	"encoding/json"
	"maps"
	"sync"

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
		queryIds, existsCursorStream := bc.ActiveStreamings["getCursorCoordinatesStream"]
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
	)
}

// cursorVisibleTo decides whether one connection may see a cursor update.
//
// The "see other viewers' cursors" lock is expressed by X-Hasura-CursorLockedUserId, which the
// not-in-meeting branch of the session-variables hook omits entirely. A bare equality test on it
// therefore yields "" == UserId -> false -> "not locked", i.e. it fails OPEN for exactly the
// connections that should see nothing. Membership and a settled refresh are checked first so the
// lock comparison is only reached when its input is meaningful.
func cursorVisibleTo(r streamingRecipient, meetingId string, cursorIsFromViewer bool) bool {
	if !r.inMeeting(meetingId) {
		return false
	}

	if !cursorIsFromViewer {
		return true // moderator/presenter cursors are not covered by the lock
	}

	if !r.lockStateKnown() {
		return false
	}

	viewersCursorLocked := r.sessionVar("x-hasura-cursorlockeduserid") == r.UserId

	return !viewersCursorLocked
}

func SendPreviousCursorPosition(browserConnection *common.BrowserConnection, queryId string) {
	recipient := snapshotStreamingRecipient(browserConnection)

	previousMessages, existsPreviousMessages := GetCursorsCache(recipient.MeetingId)
	if !existsPreviousMessages {
		return
	}

	// The replay is subject to the same rules as the live path, otherwise a connection is simply
	// handed the cached cursors of everyone in the meeting the moment it subscribes. The cache
	// does not record whether each cursor came from a viewer, so replay is withheld entirely from
	// connections that could not receive viewer cursors live.
	if !cursorVisibleTo(recipient, recipient.MeetingId, true) {
		return
	}

	items := make([]any, 0, len(previousMessages))
	for _, message := range previousMessages {
		items = append(items, message)
	}
	if len(items) == 0 {
		return
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
}

// the cache will use meetingId + userId as keys, as it needs to store only the last position for each user
var (
	CursorsCache      = make(map[string]map[string]map[string]any)
	CursorsCacheMutex sync.RWMutex
)

func GetCursorsCache(meetingId string) (map[string]map[string]any, bool) {
	CursorsCacheMutex.RLock()
	defer CursorsCacheMutex.RUnlock()
	rows, ok := CursorsCache[meetingId]
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

func StoreCursorsCache(meetingId string, userId string, row map[string]any) {
	CursorsCacheMutex.Lock()
	defer CursorsCacheMutex.Unlock()

	if _, exists := CursorsCache[meetingId]; !exists {
		CursorsCache[meetingId] = make(map[string]map[string]any)
	}
	CursorsCache[meetingId][userId] = row
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
