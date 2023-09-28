package websrv

import (
	"context"
	log "github.com/sirupsen/logrus"
	"sync"
)

func SessionTokenReader(browserConnectionId string, browserConnectionContext context.Context, fromBrowser chan interface{}, wg *sync.WaitGroup) {
	log := log.WithField("_routine", "SessionTokenReader").WithField("browserConnectionId", browserConnectionId)
	defer log.Debugf("finished")
	log.Debugf("starting")
	defer wg.Done()

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
					browserConnection.SessionToken = sessionToken
				}
			}
		}
	}
}
