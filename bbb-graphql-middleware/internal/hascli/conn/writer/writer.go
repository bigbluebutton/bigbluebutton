package writer

import (
	"sync"

	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	log "github.com/sirupsen/logrus"
	"nhooyr.io/websocket/wsjson"
)

// HasuraConnectionWriter
// process messages (middleware to hasura)
func HasuraConnectionWriter(hc *common.HasuraConnection, fromBrowserChannel chan interface{}, wg *sync.WaitGroup) {
	log := log.WithField("_routine", "HasuraConnectionWriter")

	browserConnection := hc.Browserconn

	log = log.WithField("browserConnectionId", browserConnection.Id).WithField("hasuraConnectionId", hc.Id)

	defer wg.Done()
	defer hc.ContextCancelFunc()
	defer log.Infof("finished")

RangeLoop:
	for {
		select {
		case <-hc.Context.Done():
			break RangeLoop
		case fromBrowserMessage := <-fromBrowserChannel:
			{
				if fromBrowserMessage == nil {
					continue
				}

				var fromBrowserMessageAsMap = fromBrowserMessage.(map[string]interface{})

				if fromBrowserMessageAsMap["type"] == "start" {
					var queryId = fromBrowserMessageAsMap["id"].(string)

					browserConnection.ActiveSubscriptionsMutex.Lock()
					browserConnection.ActiveSubscriptions[queryId] = common.GraphQlSubscription{
						Id:                        queryId,
						Message:                   fromBrowserMessage,
						LastSeenOnHasuraConnetion: hc.Id,
					}
					// log.Tracef("Current queries: %v", browserConnection.ActiveSubscriptions)
					browserConnection.ActiveSubscriptionsMutex.Unlock()
				}

				if fromBrowserMessageAsMap["type"] == "stop" {
					var queryId = fromBrowserMessageAsMap["id"].(string)
					browserConnection.ActiveSubscriptionsMutex.Lock()
					delete(browserConnection.ActiveSubscriptions, queryId)
					// log.Tracef("Current queries: %v", browserConnection.ActiveSubscriptions)
					browserConnection.ActiveSubscriptionsMutex.Unlock()
				}

				if fromBrowserMessageAsMap["type"] == "connection_init" {
					browserConnection.ConnectionInitMessage = fromBrowserMessage
				}

				log.Tracef("sending to hasura: %v", fromBrowserMessage)
				err := wsjson.Write(hc.Context, hc.Websocket, fromBrowserMessage)
				if err != nil {
					log.Errorf("error on write (we're disconnected from hasura): %v", err)
					return
				}
			}
		}
	}
}
