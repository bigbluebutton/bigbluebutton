package streamingserver

import (
	"bytes"
	"encoding/json"
	"fmt"
	"slices"
	"sync"
	"time"

	"bbb-graphql-middleware/internal/common"
)

func HandleGroupChatMessageBroadcastEvtMsg(receivedMessage common.RedisMessage, browserConnectionsMutex *sync.RWMutex, browserConnections map[string]*common.BrowserConnection) {
	jsonDataNext, _ := createChatMesssageGraphqlMessage(receivedMessage)

	chatParticipants, ok := receivedMessage.Core.Body["chatParticipants"].([]any)
	if !ok {
		return
	}

	browserConnectionsToSendCursor := make([]*common.BrowserConnection, 0)
	browserConnectionsMutex.RLock()
	for _, bc := range browserConnections {
		if bc.MeetingId == receivedMessage.Core.Header.MeetingId {
			fmt.Println(chatParticipants)
			fmt.Println(bc.UserId)
			if len(chatParticipants) == 0 || slices.Contains(chatParticipants, any(bc.UserId)) {
				browserConnectionsToSendCursor = append(browserConnectionsToSendCursor, bc)
			}
		}
	}
	browserConnectionsMutex.RUnlock()

	for _, bc := range browserConnectionsToSendCursor {
		bc.ActiveStreamingsMutex.RLock()
		queryId, existsCursorStream := bc.ActiveStreamings["getChatMessageStream"]
		bc.ActiveStreamingsMutex.RUnlock()
		if existsCursorStream {
			payload := bytes.Replace(jsonDataNext, QueryIdPlaceholderInBytes, []byte(queryId), 1)
			bc.FromHasuraToBrowserChannel.TrySend(payload)
		}
	}
}

func createChatMesssageGraphqlMessage(receivedMessage common.RedisMessage) ([]byte, error) {
	type RedisMessage struct {
		Core struct {
			Header struct {
				Name      string `json:"name"`
				MeetingId string `json:"meetingId"`
				UserId    string `json:"userId"`
			} `json:"header"`
			Body map[string]any `json:"body"`
		} `json:"core"`
	}

	chatId := receivedMessage.Core.Body["chatId"].(string)
	messageProps, ok := receivedMessage.Core.Body["msg"].(map[string]any)
	if !ok {
		return nil, fmt.Errorf("it was not able to read msg in GroupChatMessageBroadcastEvtMsg")
	}
	message := messageProps["message"].(string)
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
