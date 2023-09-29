package websrv

import (
	"context"
	"github.com/iMDT/bbb-graphql-middleware/internal/rediscli"
	log "github.com/sirupsen/logrus"
	"sync"
)

func ConnectionInitHandler(browserConnectionId string, browserConnectionContext context.Context, fromBrowser chan interface{}, wg *sync.WaitGroup) {
	log := log.WithField("_routine", "ConnectionInitHandler").WithField("browserConnectionId", browserConnectionId)

	log.Debugf("starting")

	defer wg.Done()
	defer log.Debugf("finished")

	BrowserConnectionsMutex.RLock()
	browserConnection := BrowserConnections[browserConnectionId]
	BrowserConnectionsMutex.RUnlock()

	// Intercept the fromBrowserMessage channel to get the sessionToken
	for fromBrowserMessage := range fromBrowser {
		// Gets the sessionToken
		if browserConnection.SessionToken == "" {
			var fromBrowserMessageAsMap = fromBrowserMessage.(map[string]interface{})

			if fromBrowserMessageAsMap["type"] == "connection_init" {
				var payloadAsMap = fromBrowserMessageAsMap["payload"].(map[string]interface{})
				var headersAsMap = payloadAsMap["headers"].(map[string]interface{})
				var sessionToken = headersAsMap["X-Session-Token"]
				if sessionToken != nil {
					sessionToken := headersAsMap["X-Session-Token"].(string)
					log.Infof("[SessionTokenReader] intercepted session token %v", sessionToken)
					BrowserConnectionsMutex.Lock()
					browserConnection.SessionToken = sessionToken
					BrowserConnectionsMutex.Unlock()

					go rediscli.SendUserGraphqlConnectionStablishedSysMsg(sessionToken, browserConnectionId)

					break
				}
			}
		}
	}
}
