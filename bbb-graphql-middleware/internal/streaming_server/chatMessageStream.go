package streamingserver

import (
	"bytes"
	"encoding/json"
	"fmt"
	"slices"
	"sync"
	"time"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
)

func HandleGroupChatMessageBroadcastEvtMsg(receivedMessage common.RedisMessage, browserConnectionsMutex *sync.RWMutex, browserConnections map[string]*common.BrowserConnection) {
	jsonDataNext, _ := createChatMesssageGraphqlMessage(receivedMessage)

	chatParticipants, ok := receivedMessage.Core.Body["chatParticipants"].([]any)
	if !ok {
		return
	}

	meetingId := receivedMessage.Core.Header.MeetingId

	browserConnectionsToSendData := make([]*common.BrowserConnection, 0)
	browserConnectionsMutex.RLock()
	for _, bc := range browserConnections {
		recipient := snapshotStreamingRecipient(bc)
		// Membership governs delivery and is established first; the participant list below is a
		// routing rule, not an authorization one.
		if !recipient.inMeeting(meetingId) {
			continue
		}
		// An empty participant list means public chat; otherwise the message belongs to a private
		// chat and only its participants may see it. The participant list is not itself a
		// membership check, so it does not substitute for the one above.
		if len(chatParticipants) == 0 || slices.Contains(chatParticipants, any(recipient.UserId)) {
			browserConnectionsToSendData = append(browserConnectionsToSendData, bc)
		}
	}
	browserConnectionsMutex.RUnlock()

	for _, bc := range browserConnectionsToSendData {
		bc.ActiveStreamingsMutex.RLock()
		queryIds, existsChatStream := bc.ActiveStreamings[config.OpChatMessageStream]
		bc.ActiveStreamingsMutex.RUnlock()
		if existsChatStream {
			for i := range queryIds {
				payload := bytes.Replace(jsonDataNext, QueryIdPlaceholderInBytes, []byte(queryIds[i]), 1)
				bc.FromHasuraToBrowserChannel.TrySend(payload)
			}
		}
	}
}

func createChatMesssageGraphqlMessage(receivedMessage common.RedisMessage) ([]byte, error) {
	chatId := receivedMessage.Core.Body["chatId"].(string)
	messageProps, ok := receivedMessage.Core.Body["msg"].(map[string]any)
	if !ok {
		return nil, fmt.Errorf("it was not able to read msg in GroupChatMessageBroadcastEvtMsg")
	}
	message := messageProps["message"].(string)
	messageAsHtml := messageProps["messageAsHtml"].(string)
	messageId := messageProps["id"].(string)
	messageMetadata := messageProps["metadata"]
	messageType := messageProps["messageType"].(string)
	senderProps, ok := messageProps["sender"].(map[string]any)
	if !ok {
		return nil, fmt.Errorf("it was not able to read sender in GroupChatMessageBroadcastEvtMsg")
	}
	senderId := senderProps["id"].(string)
	senderName := senderProps["name"].(string)
	senderRole := senderProps["role"].(string)

	now := time.Now().UTC()

	item := map[string]any{
		"chatId":          chatId,
		"message":         message,
		"messageAsHtml":   messageAsHtml,
		"messageId":       messageId,
		"messageMetadata": messageMetadata,
		"messageType":     messageType,
		"senderName":      senderName,
		"senderRole":      senderRole,
		"senderId":        senderId,
		"createdAt":       now.Format("2006-01-02T15:04:05.000Z"),
		"__typename":      "chat_message_stream",
	}

	browserResponseData := map[string]any{
		"id":   QueryIdPlaceholder,
		"type": "next",
		"payload": map[string]any{
			"data": map[string]any{
				"chat_message_stream": []any{
					item,
				},
			},
		},
	}

	return json.Marshal(browserResponseData)
}
