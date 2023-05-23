package websrv

import (
	"context"
	log "github.com/sirupsen/logrus"
	"sync"
)

func SessionTokenReader(connectionId string, browserConnectionContext context.Context, fromBrowser chan interface{}, wg *sync.WaitGroup) {
	log := log.WithField("_routine", "SessionTokenReader")

	defer wg.Done()
	defer log.Info("finished")

	BrowserConnectionsMutex.Lock()
	browserConnection := BrowserConnections[connectionId]
	BrowserConnectionsMutex.Unlock()

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

				var jsonPatchSupported = headersAsMap["json-patch-supported"]
				if jsonPatchSupported != nil {
					jsonPatchSupported := headersAsMap["json-patch-supported"].(string)
					log.Infof("[SessionTokenReader] intercepted json-patch-supported %v", jsonPatchSupported)
					browserConnection.JsonPatchSupported = jsonPatchSupported == "true"
				} else {
					browserConnection.JsonPatchSupported = false
				}
			}
		}
	}
}
