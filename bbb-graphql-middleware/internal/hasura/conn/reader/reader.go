package reader

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/iMDT/bbb-graphql-middleware/internal/hasura/retransmiter"
	"github.com/iMDT/bbb-graphql-middleware/internal/msgpatch"
	log "github.com/sirupsen/logrus"
	"hash/crc32"
	"nhooyr.io/websocket/wsjson"
	"sync"
)

// HasuraConnectionReader consumes messages from Hasura connection and add send to the browser channel
func HasuraConnectionReader(hc *common.HasuraConnection, fromHasuraToBrowserChannel *common.SafeChannel, fromBrowserToHasuraChannel *common.SafeChannel, wg *sync.WaitGroup) {
	log := log.WithField("_routine", "HasuraConnectionReader").WithField("browserConnectionId", hc.BrowserConn.Id).WithField("hasuraConnectionId", hc.Id)
	defer log.Debugf("finished")
	log.Debugf("starting")

	defer wg.Done()
	defer hc.ContextCancelFunc()

	for {
		// Read a message from hasura
		var message interface{}
		err := wsjson.Read(hc.Context, hc.Websocket, &message)
		if err != nil {
			if errors.Is(err, context.Canceled) {
				log.Debugf("Closing Hasura ws connection as Context was cancelled!")
			} else {
				log.Debugf("Error reading message from Hasura: %v", err)
			}
			return
		}

		log.Tracef("received from hasura: %v", message)

		handleMessageReceivedFromHasura(hc, fromHasuraToBrowserChannel, fromBrowserToHasuraChannel, message)
	}
}

func handleMessageReceivedFromHasura(hc *common.HasuraConnection, fromHasuraToBrowserChannel *common.SafeChannel, fromBrowserToHasuraChannel *common.SafeChannel, message interface{}) {
	var messageMap = message.(map[string]interface{})

	if messageMap != nil {
		var messageType = messageMap["type"]
		var queryId, _ = messageMap["id"].(string)

		//Check if subscription is still active!
		if queryId != "" {
			hc.BrowserConn.ActiveSubscriptionsMutex.RLock()
			subscription, ok := hc.BrowserConn.ActiveSubscriptions[queryId]
			hc.BrowserConn.ActiveSubscriptionsMutex.RUnlock()
			if !ok {
				log.Debugf("Subscription with Id %s doesn't exist anymore, skipping response.", queryId)
				return
			}

			//When Hasura send msg type "complete", this query is finished
			if messageType == "complete" {
				handleCompleteMessage(hc, queryId)
				common.ActivitiesOverviewCompleted(string(subscription.Type) + "-" + subscription.OperationName)
				common.ActivitiesOverviewCompleted("_Sum-" + string(subscription.Type))
			}

			if messageType == "data" {
				common.ActivitiesOverviewDataReceived(string(subscription.Type) + "-" + subscription.OperationName)
			}

			if messageType == "data" &&
				subscription.Type == common.Subscription {
				hasNoPreviousOccurrence := handleSubscriptionMessage(hc, messageMap, subscription, queryId)

				if !hasNoPreviousOccurrence {
					return
				}
			}

			//Set last cursor value for stream
			if subscription.Type == common.Streaming {
				handleStreamingMessage(hc, messageMap, subscription, queryId)
			}
		}

		// Retransmit the subscription start commands when hasura confirms the connection
		// this is useful in case of a connection invalidation
		if messageType == "connection_ack" {
			handleConnectionAckMessage(hc, messageMap, fromHasuraToBrowserChannel, fromBrowserToHasuraChannel)
		} else {
			// Forward the message to browser
			fromHasuraToBrowserChannel.Send(messageMap)
		}
	}
}

func handleSubscriptionMessage(hc *common.HasuraConnection, messageMap map[string]interface{}, subscription common.GraphQlSubscription, queryId string) bool {
	if payload, okPayload := messageMap["payload"].(map[string]interface{}); okPayload {
		if data, okData := payload["data"].(map[string]interface{}); okData {
			for dataKey, dataItem := range data {
				if currentDataProp, okCurrentDataProp := dataItem.([]interface{}); okCurrentDataProp {
					if dataAsJson, err := json.Marshal(currentDataProp); err == nil {
						if common.ActivitiesOverviewEnabled {
							dataSize := len(string(dataAsJson))
							dataCount := len(currentDataProp)
							common.ActivitiesOverviewDataSize(string(subscription.Type)+"-"+subscription.OperationName, int64(dataSize), int64(dataCount))
						}

						//Check whether ReceivedData is different from the LastReceivedData
						//Otherwise stop forwarding this message
						dataChecksum := crc32.ChecksumIEEE(dataAsJson)
						if subscription.LastReceivedDataChecksum == dataChecksum {
							return false
						}

						lastDataChecksumWas := subscription.LastReceivedDataChecksum
						cacheKey := fmt.Sprintf("%s-%s-%v-%v", string(subscription.Type), subscription.OperationName, subscription.LastReceivedDataChecksum, dataChecksum)

						//Store LastReceivedData Checksum
						subscription.LastReceivedDataChecksum = dataChecksum
						hc.BrowserConn.ActiveSubscriptionsMutex.Lock()
						hc.BrowserConn.ActiveSubscriptions[queryId] = subscription
						hc.BrowserConn.ActiveSubscriptionsMutex.Unlock()

						//Apply msg patch when it supports it
						if subscription.JsonPatchSupported {
							msgpatch.PatchMessage(&messageMap, queryId, dataKey, dataAsJson, hc.BrowserConn, cacheKey, lastDataChecksumWas, dataChecksum)
						}
					}
				}
			}
		}
	}

	return true
}

func handleStreamingMessage(hc *common.HasuraConnection, messageMap map[string]interface{}, subscription common.GraphQlSubscription, queryId string) {
	lastCursor := common.GetLastStreamCursorValueFromReceivedMessage(messageMap, subscription.StreamCursorField)
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
	log.Debugf("%s (%s) with Id %s finished by Hasura.", queryType, operationName, queryId)
}

func handleConnectionAckMessage(hc *common.HasuraConnection, messageMap map[string]interface{}, fromHasuraToBrowserChannel *common.SafeChannel, fromBrowserToHasuraChannel *common.SafeChannel) {
	log.Debugf("Received connection_ack")
	//Hasura connection was initialized, now it's able to send new messages to Hasura
	fromBrowserToHasuraChannel.UnfreezeChannel()

	//Avoid to send `connection_ack` to the browser when it's a reconnection
	if hc.BrowserConn.ConnAckSentToBrowser == false {
		fromHasuraToBrowserChannel.Send(messageMap)
		hc.BrowserConn.ConnAckSentToBrowser = true
	}

	go retransmiter.RetransmitSubscriptionStartMessages(hc, fromBrowserToHasuraChannel)
}
