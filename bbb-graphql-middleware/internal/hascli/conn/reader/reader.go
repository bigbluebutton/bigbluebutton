package reader

import (
	"context"
	"errors"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/iMDT/bbb-graphql-middleware/internal/hascli/retransmiter"
	"github.com/iMDT/bbb-graphql-middleware/internal/msgpatch"
	log "github.com/sirupsen/logrus"
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

		var messageAsMap = message.(map[string]interface{})

		if messageAsMap != nil {
			var messageType = messageAsMap["type"]
			var queryId, _ = messageAsMap["id"].(string)

			//Check if subscription is still active!
			if queryId != "" {
				hc.Browserconn.ActiveSubscriptionsMutex.RLock()
				subscription, ok := hc.Browserconn.ActiveSubscriptions[queryId]
				hc.Browserconn.ActiveSubscriptionsMutex.RUnlock()
				if !ok {
					log.Debugf("Subscription with Id %s doesn't exist anymore, skiping response.", queryId)
					continue
				}

				//When Hasura send msg type "complete", this query is finished
				if messageType == "complete" {
					hc.Browserconn.ActiveSubscriptionsMutex.Lock()
					delete(hc.Browserconn.ActiveSubscriptions, queryId)
					hc.Browserconn.ActiveSubscriptionsMutex.Unlock()
					log.Debugf("Subscription with Id %s finished by Hasura.", queryId)
				}

				//Apply msg patch when it supports it
				if subscription.JsonPatchSupported &&
					messageType == "data" &&
					subscription.Type == common.Subscription {
					msgpatch.PatchMessage(&messageAsMap, hc.Browserconn)
				}

				//Set last cursor value for stream
				if subscription.Type == common.Streaming {
					lastCursor := common.GetLastStreamCursorValueFromReceivedMessage(messageAsMap, subscription.StreamCursorField)
					if lastCursor != nil && subscription.StreamCursorCurrValue != lastCursor {
						subscription.StreamCursorCurrValue = lastCursor

						hc.Browserconn.ActiveSubscriptionsMutex.Lock()
						hc.Browserconn.ActiveSubscriptions[queryId] = subscription
						hc.Browserconn.ActiveSubscriptionsMutex.Unlock()
					}

				}
			}

			// Retransmit the subscription start commands when hasura confirms the connection
			// this is useful in case of a connection invalidation
			if messageType == "connection_ack" {
				log.Debugf("Received connection_ack")
				//Hasura connection was initialized, now it's able to send new messages to Hasura
				fromBrowserToHasuraChannel.UnfreezeChannel()

				//Avoid to send `connection_ack` to the browser when it's a reconnection
				if hc.Browserconn.ConnAckSentToBrowser == false {
					fromHasuraToBrowserChannel.Send(messageAsMap)
					hc.Browserconn.ConnAckSentToBrowser = true
				}

				go retransmiter.RetransmitSubscriptionStartMessages(hc, fromBrowserToHasuraChannel)
			} else {
				// Forward the message to browser
				fromHasuraToBrowserChannel.Send(messageAsMap)
			}
		}
	}
}
