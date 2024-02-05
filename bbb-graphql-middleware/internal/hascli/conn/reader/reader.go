package reader

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/iMDT/bbb-graphql-middleware/internal/hascli/retransmiter"
	"github.com/iMDT/bbb-graphql-middleware/internal/msgpatch"
	log "github.com/sirupsen/logrus"
	"hash/crc32"
	"nhooyr.io/websocket/wsjson"
	"sync"
)

// HasuraConnectionReader consumes messages from Hasura connection and add send to the browser channel
func HasuraConnectionReader(hc *common.HasuraConnection, fromHasuraToBrowserChannel *common.SafeChannel, fromBrowserToHasuraChannel *common.SafeChannel, wg *sync.WaitGroup) {
	log := log.WithField("_routine", "HasuraConnectionReader").WithField("browserConnectionId", hc.Browserconn.Id).WithField("hasuraConnectionId", hc.Id)
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
				log.Debugf("Closing ws connection as Context was cancelled!")
			} else {
				log.Errorf("Error reading message from Hasura: %v", err)
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
			hc.Browserconn.ActiveSubscriptionsMutex.RLock()
			subscription, ok := hc.Browserconn.ActiveSubscriptions[queryId]
			hc.Browserconn.ActiveSubscriptionsMutex.RUnlock()
			if !ok {
				log.Debugf("Subscription with Id %s doesn't exist anymore, skiping response.", queryId)
				return
			}

			//When Hasura send msg type "complete", this query is finished
			if messageType == "complete" {
				handleCompleteMessage(hc, queryId)
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
						//Check whether ReceivedData is different from the LastReceivedData
						//Otherwise stop forwarding this message
						dataChecksum := crc32.ChecksumIEEE(dataAsJson)
						if subscription.LastReceivedDataChecksum == dataChecksum {
							return false
						}

						//Store LastReceivedData Checksum
						subscription.LastReceivedDataChecksum = dataChecksum
						hc.Browserconn.ActiveSubscriptionsMutex.Lock()
						hc.Browserconn.ActiveSubscriptions[queryId] = subscription
						hc.Browserconn.ActiveSubscriptionsMutex.Unlock()

						//Apply msg patch when it supports it
						if subscription.JsonPatchSupported {
							msgpatch.PatchMessage(&messageMap, queryId, dataKey, dataAsJson, hc.Browserconn)
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

		hc.Browserconn.ActiveSubscriptionsMutex.Lock()
		hc.Browserconn.ActiveSubscriptions[queryId] = subscription
		hc.Browserconn.ActiveSubscriptionsMutex.Unlock()
	}
}

func handleCompleteMessage(hc *common.HasuraConnection, queryId string) {
	hc.Browserconn.ActiveSubscriptionsMutex.Lock()
	delete(hc.Browserconn.ActiveSubscriptions, queryId)
	hc.Browserconn.ActiveSubscriptionsMutex.Unlock()
	log.Debugf("Subscription with Id %s finished by Hasura.", queryId)
}

func handleConnectionAckMessage(hc *common.HasuraConnection, messageMap map[string]interface{}, fromHasuraToBrowserChannel *common.SafeChannel, fromBrowserToHasuraChannel *common.SafeChannel) {
	log.Debugf("Received connection_ack")
	//Hasura connection was initialized, now it's able to send new messages to Hasura
	fromBrowserToHasuraChannel.UnfreezeChannel()

	//Avoid to send `connection_ack` to the browser when it's a reconnection
	if hc.Browserconn.ConnAckSentToBrowser == false {
		fromHasuraToBrowserChannel.Send(messageMap)
		hc.Browserconn.ConnAckSentToBrowser = true
	}

	go retransmiter.RetransmitSubscriptionStartMessages(hc, fromBrowserToHasuraChannel)
}
