package streamingserver

import (
	"encoding/json"
	"slices"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
)

// ReadNewStreamingSubscription registers a subscription to one of the streams the middleware
// answers. It is registered under operationName, the name the reader decided from the document;
// a message the reader routed on its text comes with an empty operationName, and is registered
// under the operationName of its payload, as before.
func ReadNewStreamingSubscription(
	browserConnection *common.BrowserConnection,
	fromBrowserMessage []byte,
	operationName string,
) error {
	browserConnection.Logger.Debug("Starting ReadNewStreamingSubscription")
	defer browserConnection.Logger.Debug("Finished ReadNewStreamingSubscription")

	var browserMessage common.BrowserSubscribeMessage
	err := json.Unmarshal(fromBrowserMessage, &browserMessage)
	if err != nil {
		browserConnection.Logger.Errorf("failed to unmarshal message: %v", err)
	}
	if operationName == "" {
		operationName = browserMessage.Payload.OperationName
	}

	browserConnection.Logger.Debug(browserMessage.Type)
	browserConnection.Logger.Debug(operationName)

	if browserMessage.Type == "subscribe" && slices.Contains(config.StreamingSubscriptionsManagedByMiddleware, operationName) {
		queryId := browserMessage.ID

		// Registration is not an authorization point. Enforcement lives in the handlers, which
		// evaluate the recipient on every send, and in the replay helpers below - the correct place
		// for it, since a subscription outlives changes to the state it is authorized against and
		// this registration is never revisited.
		//
		// Do not add a check here. Connection state is not necessarily settled at this moment, and a
		// refusal at registration is permanent: the client subscribes once and does not retry.
		browserConnection.ActiveStreamingsMutex.Lock()
		if _, queryIdExists := browserConnection.ActiveStreamings[operationName]; !queryIdExists {
			browserConnection.ActiveStreamings[operationName] = []string{queryId}
		} else {
			browserConnection.ActiveStreamings[operationName] = append(browserConnection.ActiveStreamings[operationName], queryId)
		}
		browserConnection.ActiveStreamingsMutex.Unlock()

		// A replay withheld here is not lost: it is re-attempted when membership arrives.
		if !sendStreamReplay(browserConnection, operationName, queryId) {
			browserConnection.MarkStreamReplayPending(operationName, queryId)
			browserConnection.Logger.Debugf("Deferred %s replay: connection is not in the meeting yet", operationName)

			// Membership may have arrived between the check and the mark. The refresh that brought it
			// has then already drained the pending replays and will not come back for this one.
			if recipient := snapshotStreamingRecipient(browserConnection); recipient.inMeeting(recipient.MeetingId) {
				ReplayPendingStreams(browserConnection)
			}
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
