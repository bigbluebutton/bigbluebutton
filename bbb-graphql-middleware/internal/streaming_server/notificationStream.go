package streamingserver

import (
	"bytes"
	"encoding/json"
	"strings"
	"sync"
	"time"

	"bbb-graphql-middleware/internal/common"
)

func HandleNotifyAllInMeetingEvtMsg(receivedMessage common.RedisMessage, browserConnectionsMutex *sync.RWMutex, browserConnections map[string]*common.BrowserConnection) {
	jsonDataNext, _ := createGraphqlMessage(receivedMessage, false)

	browserConnectionsToSendCursor := make([]*common.BrowserConnection, 0)
	browserConnectionsMutex.RLock()
	for _, bc := range browserConnections {
		if bc.MeetingId == receivedMessage.Core.Header.MeetingId {
			browserConnectionsToSendCursor = append(browserConnectionsToSendCursor, bc)
		}
	}
	browserConnectionsMutex.RUnlock()

	for _, bc := range browserConnectionsToSendCursor {
		bc.ActiveStreamingsMutex.RLock()
		queryIds, existsCursorStream := bc.ActiveStreamings["getNotificationStream"]
		bc.ActiveStreamingsMutex.RUnlock()
		if existsCursorStream {
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

	browserConnectionsToSendCursor := make([]*common.BrowserConnection, 0)
	browserConnectionsMutex.RLock()
	for _, bc := range browserConnections {
		if bc.MeetingId == receivedMessage.Core.Header.MeetingId && bc.UserId == userId {
			browserConnectionsToSendCursor = append(browserConnectionsToSendCursor, bc)
		}
	}
	browserConnectionsMutex.RUnlock()

	for _, bc := range browserConnectionsToSendCursor {
		bc.ActiveStreamingsMutex.RLock()
		queryIds, existsCursorStream := bc.ActiveStreamings["getNotificationStream"]
		bc.ActiveStreamingsMutex.RUnlock()
		if existsCursorStream {
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

	browserConnectionsToSendCursor := make([]*common.BrowserConnection, 0)
	browserConnectionsMutex.RLock()
	for _, bc := range browserConnections {
		if bc.MeetingId == receivedMessage.Core.Header.MeetingId {
			if strings.EqualFold(role, "moderator") && bc.BBBWebSessionVariables["x-hasura-moderatorinmeeting"] == receivedMessage.Core.Header.MeetingId {
				browserConnectionsToSendCursor = append(browserConnectionsToSendCursor, bc)
			} else if strings.EqualFold(role, "presenter") && bc.BBBWebSessionVariables["x-hasura-presenterinmeeting"] == receivedMessage.Core.Header.MeetingId {
				browserConnectionsToSendCursor = append(browserConnectionsToSendCursor, bc)
			}
		}
	}
	browserConnectionsMutex.RUnlock()

	for _, bc := range browserConnectionsToSendCursor {
		bc.ActiveStreamingsMutex.RLock()
		queryIds, existsCursorStream := bc.ActiveStreamings["getNotificationStream"]
		bc.ActiveStreamingsMutex.RUnlock()
		if existsCursorStream {
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
