package streamingserver

import (
	"encoding/json"
	"slices"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
)

func ReadNewStreamingSubscription(
	browserConnection *common.BrowserConnection,
	fromBrowserMessage []byte,
) error {
	browserConnection.Logger.Debug("Starting ReadNewStreamingSubscription")
	defer browserConnection.Logger.Debug("Finished ReadNewStreamingSubscription")

	var browserMessage common.BrowserSubscribeMessage
	err := json.Unmarshal(fromBrowserMessage, &browserMessage)
	if err != nil {
		browserConnection.Logger.Errorf("failed to unmarshal message: %v", err)
	}

	browserConnection.Logger.Debug(browserMessage.Type)
	browserConnection.Logger.Debug(browserMessage.Payload.OperationName)

	if browserMessage.Type == "subscribe" && slices.Contains(config.StreamingSubscriptionsManagedByMiddleware, browserMessage.Payload.OperationName) {
		queryId := browserMessage.ID

		browserConnection.ActiveStreamingsMutex.Lock()
		if _, queryIdExists := browserConnection.ActiveStreamings[browserMessage.Payload.OperationName]; !queryIdExists {
			browserConnection.ActiveStreamings[browserMessage.Payload.OperationName] = []string{queryId}
		} else {
			browserConnection.ActiveStreamings[browserMessage.Payload.OperationName] = append(browserConnection.ActiveStreamings[browserMessage.Payload.OperationName], queryId)
		}
		browserConnection.ActiveStreamingsMutex.Unlock()

		if browserMessage.Payload.OperationName == "getCursorCoordinatesStream" {
			SendPreviousCursorPosition(browserConnection, queryId)
		}

		if browserMessage.Payload.OperationName == "getUserMutedStateStream" {
			SendPreviousMutedState(browserConnection, queryId)
		}
	}

	return nil
}

func sendErrorMessage(browserConnection *common.BrowserConnection, messageId string, errorMessage string) {
	browserConnection.Logger.Error(errorMessage)

	// Error on sending action, return error msg to client
	browserResponseData := map[string]any{
		"id":   messageId,
		"type": "error",
		"payload": []any{
			map[string]any{
				"message": errorMessage,
			},
		},
	}
	jsonDataError, _ := json.Marshal(browserResponseData)
	browserConnection.FromHasuraToBrowserChannel.SendWait(browserConnection.Context, jsonDataError)

	// Return complete msg to client
	browserResponseComplete := map[string]any{
		"id":   messageId,
		"type": "complete",
	}
	jsonDataComplete, _ := json.Marshal(browserResponseComplete)
	browserConnection.FromHasuraToBrowserChannel.SendWait(browserConnection.Context, jsonDataComplete)
}
