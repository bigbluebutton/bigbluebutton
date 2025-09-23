package streamingserver

import (
	"encoding/json"

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

	operationName := "getCursorCoordinatesStream"
	if browserMessage.Type == "subscribe" && browserMessage.Payload.OperationName == operationName {
		queryId := browserMessage.ID

		browserConnection.ActiveStreamingsMutex.RLock()
		_, queryIdExists := browserConnection.ActiveStreamings[operationName]
		browserConnection.ActiveStreamingsMutex.RUnlock()
		if queryIdExists {
			sendErrorMessage(browserConnection, queryId, "Only one getCursorCoordinatesStream subscription is allowed")
			return nil
		}

		browserConnection.ActiveStreamingsMutex.Lock()
		browserConnection.ActiveStreamings[operationName] = queryId
		browserConnection.ActiveStreamingsMutex.Unlock()

		SendPreviousCursorPosition(browserConnection, queryId)

		browserConnection.Logger.Infof("Added new getCursorCoordinatesStream streaming %s ", queryId)
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
