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

		// Registration is not an authorization point. Enforcement lives in the handlers, which
		// evaluate the recipient on every send, and in the replay helpers below - the correct place
		// for it, since a subscription outlives changes to the state it is authorized against and
		// this registration is never revisited.
		//
		// Do not add a check here. Connection state is not necessarily settled at this moment, and a
		// refusal at registration is permanent: the client subscribes once and does not retry.
		browserConnection.ActiveStreamingsMutex.Lock()
		if _, queryIdExists := browserConnection.ActiveStreamings[browserMessage.Payload.OperationName]; !queryIdExists {
			browserConnection.ActiveStreamings[browserMessage.Payload.OperationName] = []string{queryId}
		} else {
			browserConnection.ActiveStreamings[browserMessage.Payload.OperationName] = append(browserConnection.ActiveStreamings[browserMessage.Payload.OperationName], queryId)
		}
		browserConnection.ActiveStreamingsMutex.Unlock()

		// A replay withheld here is not lost: it is re-attempted when membership arrives.
		if !sendStreamReplay(browserConnection, browserMessage.Payload.OperationName, queryId) {
			browserConnection.MarkStreamReplayPending(browserMessage.Payload.OperationName, queryId)
			browserConnection.Logger.Debugf("Deferred %s replay: connection is not in the meeting yet", browserMessage.Payload.OperationName)
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
