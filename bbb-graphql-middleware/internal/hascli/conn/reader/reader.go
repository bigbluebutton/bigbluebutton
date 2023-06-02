package reader

import (
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/iMDT/bbb-graphql-middleware/internal/hascli/replayer"
	"github.com/iMDT/bbb-graphql-middleware/internal/msgpatch"
	log "github.com/sirupsen/logrus"
	"nhooyr.io/websocket/wsjson"
	"sync"
)

// HasuraConnectionReader consumes messages from Hasura connection and add send to the browser channel
func HasuraConnectionReader(hc *common.HasuraConnection, fromHasuraToBrowserChannel chan interface{}, fromBrowserToHasuraChannel chan interface{}, wg *sync.WaitGroup) {
	log := log.WithField("_routine", "HasuraConnectionReader").WithField("browserConnectionId", hc.Browserconn.Id).WithField("hasuraConnectionId", hc.Id)

	defer wg.Done()
	defer hc.ContextCancelFunc()

	defer log.Info("finished")

	for {
		// Read a message from hasura
		var message interface{}
		err := wsjson.Read(hc.Context, hc.Websocket, &message)
		if err != nil {
			log.Errorf("Error: %v", err)
			return
		}

		log.Tracef("received from hasura: %v", message)

		var messageAsMap = message.(map[string]interface{})
		if messageAsMap != nil {
			var messageType = messageAsMap["type"]
			var queryId, _ = messageAsMap["id"].(string)

			//Check if subscription is still active!
			if queryId != "" {
				hc.Browserconn.ActiveSubscriptionsMutex.Lock()
				subscription, ok := hc.Browserconn.ActiveSubscriptions[queryId]
				hc.Browserconn.ActiveSubscriptionsMutex.Unlock()
				if !ok {
					log.Debugf("Subscription with Id %s doesn't exist anymore, skiping response.", queryId)
					return
				}

				//When Hasura send msg type "complete", this query is finished
				if messageType == "complete" {
					hc.Browserconn.ActiveSubscriptionsMutex.Lock()
					delete(hc.Browserconn.ActiveSubscriptions, queryId)
					hc.Browserconn.ActiveSubscriptionsMutex.Unlock()
					log.Infof("Subscription with Id %s finished by Hasura.", queryId)
				}

				//Apply msg patch when it supports it
				if subscription.JsonPatchSupported &&
					messageType == "data" &&
					subscription.Type == common.Subscription {
					msgpatch.PatchMessage(&messageAsMap, hc.Browserconn)
				}
			}

			// Write the message to browser
			fromHasuraToBrowserChannel <- messageAsMap

			// Replay the subscription start commands when hasura confirms the connection
			// this is useful in case of a connection invalidation
			if messageType == "connection_ack" {
				go replayer.ReplaySubscriptionStartMessages(hc, fromBrowserToHasuraChannel)
			}
		}
	}
}
