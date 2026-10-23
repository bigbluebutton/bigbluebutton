package streamingserver

import (
	"bytes"
	"encoding/json"
	"strings"
	"sync"
	"time"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
)

func HandleNotifyAllInMeetingEvtMsg(receivedMessage common.RedisMessage, browserConnectionsMutex *sync.RWMutex, browserConnections map[string]*common.BrowserConnection) {
	jsonDataNext, _ := createGraphqlMessage(receivedMessage, false)

	meetingId := receivedMessage.Core.Header.MeetingId

	browserConnectionsToSendData := make([]*common.BrowserConnection, 0)
	browserConnectionsMutex.RLock()
	for _, bc := range browserConnections {
		// Meeting-wide notifications carry user names (e.g. the join push alert), so delivery is
		// limited to connections currently in the meeting.
		if snapshotStreamingRecipient(bc).inMeeting(meetingId) {
			browserConnectionsToSendData = append(browserConnectionsToSendData, bc)
		}
	}
	browserConnectionsMutex.RUnlock()

	for _, bc := range browserConnectionsToSendData {
		bc.ActiveStreamingsMutex.RLock()
		queryIds, existsNotificationStream := bc.ActiveStreamings[config.OpNotificationStream]
		bc.ActiveStreamingsMutex.RUnlock()
		if existsNotificationStream {
			for i := range queryIds {
				payload := bytes.Replace(jsonDataNext, QueryIdPlaceholderInBytes, []byte(queryIds[i]), 1)
				bc.FromHasuraToBrowserChannel.TrySend(payload)
			}
		}
	}
}

func HandleNotifyUserInMeetingEvtMsg(receivedMessage common.RedisMessage, browserConnectionsMutex *sync.RWMutex, browserConnections map[string]*common.BrowserConnection) {
	userId := receivedMessage.Core.Body["userId"].(string)
	jsonDataNext, _ := createGraphqlMessage(receivedMessage, true)

	meetingId := receivedMessage.Core.Header.MeetingId

	browserConnectionsToSendCursor := make([]*common.BrowserConnection, 0)
	browserConnectionsMutex.RLock()
	for _, bc := range browserConnections {
		recipient := snapshotStreamingRecipient(bc)
		if recipient.inMeeting(meetingId) && recipient.UserId == userId {
			browserConnectionsToSendCursor = append(browserConnectionsToSendCursor, bc)
		}
	}
	browserConnectionsMutex.RUnlock()

	for _, bc := range browserConnectionsToSendCursor {
		bc.ActiveStreamingsMutex.RLock()
		queryIds, existsNotificationStream := bc.ActiveStreamings[config.OpNotificationStream]
		bc.ActiveStreamingsMutex.RUnlock()
		if existsNotificationStream {
			for i := range queryIds {
				payload := bytes.Replace(jsonDataNext, QueryIdPlaceholderInBytes, []byte(queryIds[i]), 1)
				bc.FromHasuraToBrowserChannel.TrySend(payload)
			}
		}
	}
}

func HandleNotifyRoleInMeetingEvtMsg(receivedMessage common.RedisMessage, browserConnectionsMutex *sync.RWMutex, browserConnections map[string]*common.BrowserConnection) {
	role := receivedMessage.Core.Body["role"].(string)
	jsonDataNext, _ := createGraphqlMessage(receivedMessage, false)

	meetingId := receivedMessage.Core.Header.MeetingId

	browserConnectionsToSendCursor := make([]*common.BrowserConnection, 0)
	browserConnectionsMutex.RLock()
	for _, bc := range browserConnections {
		recipient := snapshotStreamingRecipient(bc)
		// X-Hasura-ModeratorInMeeting / PresenterInMeeting are derived from the RegisteredUser
		// role, independently of current meeting membership, so membership alone does not make
		// them meaningful - they must also have been refreshed since whatever last changed them.
		//
		// The presenter branch is not reachable from any current producer, which only ever targets
		// moderators. It is kept because the settled check is doing real work there: presenter is
		// orthogonal to role, so a locked viewer-presenter is inside the fan-out of a lock-settings
		// change, unlike a moderator.
		matches := recipient.inMeeting(meetingId) && recipient.sessionVarsSettled()
		isModerator := matches && strings.EqualFold(role, "moderator") && recipient.sessionVar("x-hasura-moderatorinmeeting") == meetingId
		isPresenter := matches && strings.EqualFold(role, "presenter") && recipient.sessionVar("x-hasura-presenterinmeeting") == meetingId
		if isModerator || isPresenter {
			browserConnectionsToSendCursor = append(browserConnectionsToSendCursor, bc)
		}
	}
	browserConnectionsMutex.RUnlock()

	for _, bc := range browserConnectionsToSendCursor {
		bc.ActiveStreamingsMutex.RLock()
		queryIds, existsNotificationStream := bc.ActiveStreamings[config.OpNotificationStream]
		bc.ActiveStreamingsMutex.RUnlock()
		if existsNotificationStream {
			for i := range queryIds {
				payload := bytes.Replace(jsonDataNext, QueryIdPlaceholderInBytes, []byte(queryIds[i]), 1)
				bc.FromHasuraToBrowserChannel.TrySend(payload)
			}
		}
	}
}

func createGraphqlMessage(receivedMessage common.RedisMessage, isSingleUserNotification bool) ([]byte, error) {
	notificationType := receivedMessage.Core.Body["notificationType"].(string)
	icon := receivedMessage.Core.Body["icon"].(string)
	messageId := receivedMessage.Core.Body["messageId"].(string)
	messageValues := receivedMessage.Core.Body["messageValues"]
	now := time.Now().UTC()

	item := map[string]any{
		"notificationType":         notificationType,
		"icon":                     icon,
		"messageId":                messageId,
		"messageValues":            messageValues,
		"isSingleUserNotification": isSingleUserNotification,
		"createdAt":                now.Format("2006-01-02T15:04:05.000Z"),
		"__typename":               "notification",
	}

	browserResponseData := map[string]any{
		"id":   QueryIdPlaceholder,
		"type": "next",
		"payload": map[string]any{
			"data": map[string]any{
				"notification_stream": []any{
					item,
				},
			},
		},
	}

	return json.Marshal(browserResponseData)
}
