package reader

import (
	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/hasura/retransmiter"
	"bbb-graphql-middleware/internal/msgpatch"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/sirupsen/logrus"
	"hash/crc32"
	"nhooyr.io/websocket"
	"sync"
)

// HasuraConnectionReader consumes messages from Hasura connection and add send to the browser channel
func HasuraConnectionReader(hc *common.HasuraConnection, wg *sync.WaitGroup) {
	defer hc.BrowserConn.Logger.Debugf("finished")
	hc.BrowserConn.Logger.Debugf("starting")

	defer wg.Done()
	defer hc.ContextCancelFunc()

	for {
		messageType, message, err := hc.Websocket.Read(hc.Context)
		var closeError *websocket.CloseError

		if err != nil {
			if errors.Is(err, context.Canceled) {
				hc.BrowserConn.Logger.Debugf("Closing Hasura ws connection as Context was cancelled!")
			} else if errors.As(err, &closeError) {
				hc.WebsocketCloseError = closeError
				hc.BrowserConn.Logger.Debug("WebSocket connection closed: status = %v, reason = %s", closeError.Code, closeError.Reason)
				//TODO check if it should send {"type":"connection_error","payload":"Authentication hook unauthorized this request"}
			} else {
				if websocket.CloseStatus(err) == -1 {
					//It doesn't have a CloseError, it will reconnect do Hasura
				} else {
					//In case Hasura sent an CloseError, it will forward it to browser and disconnect
					hc.WebsocketCloseError = &websocket.CloseError{
						Code:   websocket.CloseStatus(err),
						Reason: "Graphql connection closed with error" + err.Error(),
					}
				}

				hc.BrowserConn.Logger.Debugf("Error reading message from Hasura: %v", err)
			}
			return
		}

		if messageType != websocket.MessageText {
			hc.BrowserConn.Logger.Warnf("received non-text message: %v", messageType)
			continue
		}

		hc.BrowserConn.Logger.Tracef("received from hasura: %s", string(message))

		handleMessageReceivedFromHasura(hc, message)
	}
}

var QueryIdPlaceholderInBytes = []byte("--------------QUERY-ID--------------") //36 chars

func handleMessageReceivedFromHasura(hc *common.HasuraConnection, message []byte) {
	type HasuraMessageInfo struct {
		Type string `json:"type"`
		ID   string `json:"id"`
	}
	var hasuraMessageInfo HasuraMessageInfo
	err := json.Unmarshal(message, &hasuraMessageInfo)
	if err != nil {
		hc.BrowserConn.Logger.Errorf("failed to unmarshal message: %v", err)
		return
	}

	queryIdReplacementApplied := false
	queryIdInBytes := []byte(hasuraMessageInfo.ID)

	//Check if subscription is still active!
	if hasuraMessageInfo.ID != "" {
		hc.BrowserConn.ActiveSubscriptionsMutex.RLock()
		subscription, ok := hc.BrowserConn.ActiveSubscriptions[hasuraMessageInfo.ID]
		hc.BrowserConn.ActiveSubscriptionsMutex.RUnlock()
		if !ok {
			hc.BrowserConn.Logger.Debugf("Subscription with Id %s doesn't exist anymore, skipping response.", hasuraMessageInfo.ID)
			return
		}

		//When Hasura send msg type "complete", this query is finished
		if hasuraMessageInfo.Type == "complete" {
			handleCompleteMessage(hc, hasuraMessageInfo.ID)
		}

		if hasuraMessageInfo.Type == "next" {
			common.GqlReceivedDataCounter.
				With(prometheus.Labels{
					"type":          string(subscription.Type),
					"operationName": subscription.OperationName}).
				Inc()
		}

		if hasuraMessageInfo.Type == "next" &&
			subscription.Type == common.Subscription {

			//Remove queryId from message
			message = bytes.Replace(message, queryIdInBytes, QueryIdPlaceholderInBytes, 1)
			queryIdReplacementApplied = true

			isDifferentFromPreviousMessage := handleSubscriptionMessage(hc, &message, subscription, hasuraMessageInfo.ID)

			//Stop processing case it is the same message (probably is a reconnection with Hasura)
			if !isDifferentFromPreviousMessage {
				return
			}
		}

		//Set last cursor value for stream
		if subscription.Type == common.Streaming {
			//Remove queryId from message
			messageWithoutId := bytes.Replace(message, queryIdInBytes, QueryIdPlaceholderInBytes, 1)

			handleStreamingMessage(hc, messageWithoutId, subscription, hasuraMessageInfo.ID)
		}
	}

	// Retransmit the subscription start commands when hasura confirms the connection
	// this is useful in case of a connection invalidation
	if hasuraMessageInfo.Type == "connection_ack" {
		handleConnectionAckMessage(hc, message)
	} else {
		if queryIdReplacementApplied {
			message = bytes.Replace(message, QueryIdPlaceholderInBytes, queryIdInBytes, 1)
		}

		// Forward the message to browser
		hc.BrowserConn.FromHasuraToBrowserChannel.Send(message)
	}
}

func handleSubscriptionMessage(hc *common.HasuraConnection, message *[]byte, subscription common.GraphQlSubscription, queryId string) bool {
	dataChecksum, messageDataKey, messageData := getHasuraMessage(*message, subscription, hc.BrowserConn.Logger)

	//Check whether ReceivedData is different from the LastReceivedData
	//Otherwise stop forwarding this message
	if subscription.LastReceivedDataChecksum == dataChecksum {
		return false
	}

	lastDataChecksumWas := subscription.LastReceivedDataChecksum
	lastReceivedDataWas := subscription.LastReceivedData
	cacheKey := mergeUint32(subscription.LastReceivedDataChecksum, dataChecksum)

	//Store LastReceivedData Checksum
	subscription.LastReceivedData = messageData
	subscription.LastReceivedDataChecksum = dataChecksum
	hc.BrowserConn.ActiveSubscriptionsMutex.Lock()
	hc.BrowserConn.ActiveSubscriptions[queryId] = subscription
	hc.BrowserConn.ActiveSubscriptionsMutex.Unlock()

	//Apply msg patch when it supports it
	if subscription.JsonPatchSupported {
		*message = msgpatch.GetPatchedMessage(*message, messageDataKey, lastReceivedDataWas, messageData, cacheKey, lastDataChecksumWas, dataChecksum)
	}

	return true
}

func mergeUint32(a, b uint32) uint32 {
	return (a << 16) | (b >> 16)
}

func handleStreamingMessage(hc *common.HasuraConnection, message []byte, subscription common.GraphQlSubscription, queryId string) {
	lastCursor := common.GetLastStreamCursorValueFromReceivedMessage(message, subscription.StreamCursorField)
	if lastCursor != nil && subscription.StreamCursorCurrValue != lastCursor {
		subscription.StreamCursorCurrValue = lastCursor

		hc.BrowserConn.ActiveSubscriptionsMutex.Lock()
		hc.BrowserConn.ActiveSubscriptions[queryId] = subscription
		hc.BrowserConn.ActiveSubscriptionsMutex.Unlock()
	}
}

func handleCompleteMessage(hc *common.HasuraConnection, queryId string) {
	hc.BrowserConn.ActiveSubscriptionsMutex.Lock()
	queryType := hc.BrowserConn.ActiveSubscriptions[queryId].Type
	operationName := hc.BrowserConn.ActiveSubscriptions[queryId].OperationName
	delete(hc.BrowserConn.ActiveSubscriptions, queryId)
	hc.BrowserConn.ActiveSubscriptionsMutex.Unlock()
	hc.BrowserConn.Logger.Debugf("%s (%s) with Id %s finished by Hasura.", queryType, operationName, queryId)
}

func handleConnectionAckMessage(hc *common.HasuraConnection, message []byte) {
	hc.BrowserConn.Logger.Debugf("Received connection_ack")
	//Hasura connection was initialized, now it's able to send new messages to Hasura
	hc.BrowserConn.FromBrowserToHasuraChannel.UnfreezeChannel()

	//Avoid to send `connection_ack` to the browser when it's a reconnection
	if hc.BrowserConn.ConnAckSentToBrowser == false {
		hc.BrowserConn.FromHasuraToBrowserChannel.Send(message)
		hc.BrowserConn.ConnAckSentToBrowser = true
	}

	go retransmiter.RetransmitSubscriptionStartMessages(hc)
}

func getHasuraMessage(message []byte, subscription common.GraphQlSubscription, logger *logrus.Entry) (uint32, string, common.HasuraMessage) {
	dataChecksum := crc32.ChecksumIEEE(message)

	common.GlobalCacheLocks.Lock(dataChecksum)
	defer common.GlobalCacheLocks.Unlock(dataChecksum)

	dataKey, hasuraMessage, dataMapExists := common.GetHasuraMessageCache(dataChecksum)
	if dataMapExists {
		return dataChecksum, dataKey, hasuraMessage
	}

	err := json.Unmarshal(message, &hasuraMessage)
	if err != nil {
		logger.Fatalf("Error unmarshalling JSON: %v", err)
	}

	for key := range hasuraMessage.Payload.Data {
		dataKey = key
		break
	}

	common.StoreHasuraMessageCache(dataChecksum, dataKey, hasuraMessage)

	//Add Prometheus metrics only once for each dataChecksum
	dataSize := len(string(message))
	common.GqlReceivedDataPayloadSize.
		With(prometheus.Labels{
			"type":          string(subscription.Type),
			"operationName": subscription.OperationName}).
		Observe(float64(dataSize))

	if common.PrometheusAdvancedMetricsEnabled {
		// Decode the JSON array into raw messages
		var rawMessages []json.RawMessage
		err := json.Unmarshal(hasuraMessage.Payload.Data[dataKey], &rawMessages)
		if err == nil {
			// Get the length of the array
			dataLength := len(rawMessages)

			common.GqlReceivedDataPayloadLength.
				With(prometheus.Labels{
					"type":          string(subscription.Type),
					"operationName": subscription.OperationName}).
				Observe(float64(dataLength))

		}
	}

	return dataChecksum, dataKey, hasuraMessage
}
