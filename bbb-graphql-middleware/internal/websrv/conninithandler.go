package websrv

import (
	"context"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	log "github.com/sirupsen/logrus"
	"sync"
)

func ConnectionInitHandler(browserConnectionId string, browserConnectionContext context.Context, fromBrowserToHasuraConnectionEstablishingChannel *common.SafeChannel, wg *sync.WaitGroup) {
	log := log.WithField("_routine", "ConnectionInitHandler").WithField("browserConnectionId", browserConnectionId)

	log.Debugf("starting")

	defer wg.Done()
	defer log.Debugf("finished")

	BrowserConnectionsMutex.RLock()
	browserConnection := BrowserConnections[browserConnectionId]
	BrowserConnectionsMutex.RUnlock()

	// Intercept the fromBrowserMessage channel to get the sessionToken
	for {
		fromBrowserMessage, ok := fromBrowserToHasuraConnectionEstablishingChannel.Receive()
		if !ok {
			//Received all messages. Channel is closed
			return
		}
		if browserConnection.SessionToken == "" {
			var fromBrowserMessageAsMap = fromBrowserMessage.(map[string]interface{})

			if fromBrowserMessageAsMap["type"] == "connection_init" {
				var payloadAsMap = fromBrowserMessageAsMap["payload"].(map[string]interface{})
				var headersAsMap = payloadAsMap["headers"].(map[string]interface{})
				var sessionToken = headersAsMap["X-Session-Token"]
				if sessionToken != nil {
					sessionToken := headersAsMap["X-Session-Token"].(string)
					log.Debugf("[SessionTokenReader] intercepted session token %v", sessionToken)
					BrowserConnectionsMutex.Lock()
					browserConnection.SessionToken = sessionToken
					BrowserConnectionsMutex.Unlock()

					go SendUserGraphqlConnectionEstablishedSysMsg(sessionToken, browserConnectionId)
					fromBrowserToHasuraConnectionEstablishingChannel.Close()
					break
				}
			}
		}
	}
}
