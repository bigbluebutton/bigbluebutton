package websrv

import (
	"context"
	"fmt"
	"github.com/iMDT/bbb-graphql-middleware/internal/bbb_web"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/iMDT/bbb-graphql-middleware/internal/gql_actions"
	"github.com/iMDT/bbb-graphql-middleware/internal/hasura"
	"github.com/iMDT/bbb-graphql-middleware/internal/msgpatch"
	"github.com/iMDT/bbb-graphql-middleware/internal/websrv/reader"
	"github.com/iMDT/bbb-graphql-middleware/internal/websrv/writer"
	log "github.com/sirupsen/logrus"
	"net/http"
	"nhooyr.io/websocket"
	"os"
	"strings"
	"sync"
	"time"
)

var lastBrowserConnectionId int

// Buffer size of the channels
var bufferSize = 100

// active browser connections
var BrowserConnections = make(map[string]*common.BrowserConnection)
var BrowserConnectionsMutex = &sync.RWMutex{}

// Handle client connection
// This is the connection that comes from browser
func ConnectionHandler(w http.ResponseWriter, r *http.Request) {
	log := log.WithField("_routine", "ConnectionHandler")
	common.ActivitiesOverviewStarted("__BrowserConnection")
	defer common.ActivitiesOverviewCompleted("__BrowserConnection")

	// Obtain id for this connection
	lastBrowserConnectionId++
	browserConnectionId := "BC" + fmt.Sprintf("%010d", lastBrowserConnectionId)
	log = log.WithField("browserConnectionId", browserConnectionId)

	// Starts a context that will be dependent on the connection, so we can cancel subroutines when the connection is dropped
	browserConnectionContext, browserConnectionContextCancel := context.WithCancel(r.Context())
	defer browserConnectionContextCancel()

	// Add sub-protocol
	var acceptOptions websocket.AcceptOptions
	acceptOptions.Subprotocols = append(acceptOptions.Subprotocols, "graphql-transport-ws")
	bbbOrigin := os.Getenv("BBB_GRAPHQL_MIDDLEWARE_ORIGIN")
	if bbbOrigin != "" {
		acceptOptions.OriginPatterns = append(acceptOptions.OriginPatterns, bbbOrigin)
	}

	browserWsConn, err := websocket.Accept(w, r, &acceptOptions)
	browserWsConn.SetReadLimit(9999999) //10MB
	if err != nil {
		log.Errorf("error: %v", err)
	}
	defer browserWsConn.Close(websocket.StatusInternalError, "the sky is falling")

	var thisConnection = common.BrowserConnection{
		Id:                    browserConnectionId,
		Websocket:             browserWsConn,
		BrowserRequestCookies: r.Cookies(),
		ActiveSubscriptions:   make(map[string]common.GraphQlSubscription, 1),
		Context:               browserConnectionContext,
		ContextCancelFunc:     browserConnectionContextCancel,
		ConnAckSentToBrowser:  false,
	}

	BrowserConnectionsMutex.Lock()
	BrowserConnections[browserConnectionId] = &thisConnection
	BrowserConnectionsMutex.Unlock()

	defer func() {
		msgpatch.RemoveConnCacheDir(browserConnectionId)
		BrowserConnectionsMutex.Lock()
		_, bcExists := BrowserConnections[browserConnectionId]
		if bcExists {
			sessionTokenRemoved := BrowserConnections[browserConnectionId].SessionToken
			delete(BrowserConnections, browserConnectionId)
			go SendUserGraphqlConnectionClosedSysMsg(sessionTokenRemoved, browserConnectionId)
		}
		BrowserConnectionsMutex.Unlock()

		log.Infof("connection removed")
	}()

	// Log it
	log.Infof("connection accepted")

	// Create channels
	fromBrowserToHasuraConnectionEstablishingChannel := common.NewSafeChannel(bufferSize)
	fromBrowserToHasuraChannel := common.NewSafeChannel(bufferSize)
	fromBrowserToGqlActionsChannel := common.NewSafeChannel(bufferSize)
	fromHasuraToBrowserChannel := common.NewSafeChannel(bufferSize)

	// Configure the wait group (to hold this routine execution until both are completed)
	var wgAll sync.WaitGroup
	wgAll.Add(3)

	// Other wait group to close this connection once Browser Reader dies
	var wgReader sync.WaitGroup
	wgReader.Add(1)

	// Reads from browser connection, writes into fromBrowserToHasuraChannel and fromBrowserToHasuraConnectionEstablishingChannel
	go reader.BrowserConnectionReader(
		browserConnectionId,
		browserConnectionContext,
		browserConnectionContextCancel,
		browserWsConn,
		fromBrowserToGqlActionsChannel,
		fromBrowserToHasuraChannel,
		fromBrowserToHasuraConnectionEstablishingChannel,
		[]*sync.WaitGroup{&wgAll, &wgReader})

	go func() {
		wgReader.Wait()
		log.Debug("BrowserConnectionReader finished, closing Write Channel")
		fromHasuraToBrowserChannel.Close()
		thisConnection.Disconnected = true
	}()

	//Obtain user session variables from bbb-web
	if errorOnInitConnection := connectionInitHandler(&thisConnection, fromBrowserToHasuraConnectionEstablishingChannel); errorOnInitConnection != nil {
		//If the server wishes to reject the connection it is recommended to close the socket with `4403: Forbidden`.
		//https://github.com/enisdenjo/graphql-ws/blob/63881c3372a3564bf42040e3f572dd74e41b2e49/PROTOCOL.md?plain=1#L36
		wsError := &websocket.CloseError{
			Code:   websocket.StatusCode(4403),
			Reason: errorOnInitConnection.Error(),
		}
		browserWsConn.Close(wsError.Code, wsError.Reason)
		browserConnectionContextCancel()
	}

	// Ensure a hasura client is running while the browser is connected
	go func() {
		log.Debugf("starting hasura client")

	BrowserConnectedLoop:
		for {
			select {
			case <-browserConnectionContext.Done():
				break BrowserConnectedLoop
			default:
				{
					log.Debugf("creating hasura client")
					BrowserConnectionsMutex.RLock()
					thisBrowserConnection := BrowserConnections[browserConnectionId]
					BrowserConnectionsMutex.RUnlock()
					if thisBrowserConnection != nil {
						log.Debugf("created hasura client")
						hasura.HasuraClient(
							thisBrowserConnection,
							fromBrowserToHasuraChannel,
							fromHasuraToBrowserChannel)
					}
					time.Sleep(100 * time.Millisecond)
				}
			}
		}
	}()

	// Ensure a gql-actions client is running while the browser is connected
	go func() {
		log.Debugf("starting gql-actions client")

	BrowserConnectedLoop:
		for {
			select {
			case <-browserConnectionContext.Done():
				break BrowserConnectedLoop
			default:
				{
					log.Debugf("creating gql-actions client")
					BrowserConnectionsMutex.RLock()
					thisBrowserConnection := BrowserConnections[browserConnectionId]
					BrowserConnectionsMutex.RUnlock()
					if thisBrowserConnection != nil {
						log.Debugf("created gql-actions client")

						BrowserConnectionsMutex.Lock()
						thisBrowserConnection.GraphqlActionsContext, thisBrowserConnection.GraphqlActionsContextCancel = context.WithCancel(browserConnectionContext)
						BrowserConnectionsMutex.Unlock()

						gql_actions.GraphqlActionsClient(
							thisBrowserConnection,
							fromBrowserToGqlActionsChannel,
							fromHasuraToBrowserChannel)
					}
					time.Sleep(1000 * time.Millisecond)
				}
			}
		}
	}()

	// Reads from fromHasuraToBrowserChannel, writes to browser connection
	go writer.BrowserConnectionWriter(browserConnectionId, browserConnectionContext, browserWsConn, fromHasuraToBrowserChannel, &wgAll)

	// Wait until all routines are finished
	wgAll.Wait()
}

func InvalidateSessionTokenConnections(sessionTokenToInvalidate string) {
	BrowserConnectionsMutex.RLock()
	connectionsToProcess := make([]*common.BrowserConnection, 0)
	for _, browserConnection := range BrowserConnections {
		if browserConnection.SessionToken == sessionTokenToInvalidate {
			connectionsToProcess = append(connectionsToProcess, browserConnection)
		}
	}
	BrowserConnectionsMutex.RUnlock()

	var wg sync.WaitGroup
	for _, browserConnection := range connectionsToProcess {
		wg.Add(1)
		go func(bc *common.BrowserConnection) {
			defer wg.Done()
			go refreshUserSessionVariables(bc)
			invalidateHasuraConnectionForSessionToken(bc, sessionTokenToInvalidate)
		}(browserConnection)
	}
	wg.Wait()
}

func invalidateHasuraConnectionForSessionToken(bc *common.BrowserConnection, sessionToken string) {
	if bc.HasuraConnection == nil {
		return // If there's no Hasura connection, there's nothing to invalidate.
	}

	hasuraConnectionId := bc.HasuraConnection.Id

	// Send message to stop receiving new messages from the browser.
	bc.HasuraConnection.FreezeMsgFromBrowserChan.Send(true)
	bc.GraphqlActionsContextCancel()

	// Wait until there are no active mutations.
	for iterationCount := 0; iterationCount < 20; iterationCount++ {
		activeMutationFound := false
		bc.ActiveSubscriptionsMutex.RLock()
		for _, subscription := range bc.ActiveSubscriptions {
			if subscription.Type == common.Mutation {
				activeMutationFound = true
				break
			}
		}
		bc.ActiveSubscriptionsMutex.RUnlock()

		if !activeMutationFound {
			break // Exit the loop if no active mutations are found.
		}
		time.Sleep(100 * time.Millisecond) // Wait a bit before checking again.
	}

	log.Debugf("Processing invalidate request for sessionToken %v (hasura connection %v)", sessionToken, hasuraConnectionId)

	// Cancel the Hasura connection context to clean up resources.
	if bc.HasuraConnection != nil && bc.HasuraConnection.ContextCancelFunc != nil {
		bc.HasuraConnection.ContextCancelFunc()
	}

	log.Debugf("Processed invalidate request for sessionToken %v (hasura connection %v)", sessionToken, hasuraConnectionId)

	// Send a reconnection confirmation message
	go SendUserGraphqlReconnectionForcedEvtMsg(sessionToken)
}

func refreshUserSessionVariables(browserConnection *common.BrowserConnection) error {
	BrowserConnectionsMutex.RLock()
	browserSessionToken := browserConnection.SessionToken
	browserConnectionId := browserConnection.Id
	browserConnectionCookies := browserConnection.BrowserRequestCookies
	BrowserConnectionsMutex.RUnlock()

	// Check authorization
	sessionVariables, err := bbb_web.BBBWebClient(browserConnectionId, browserSessionToken, browserConnectionCookies)
	if err != nil {
		log.Error(err)
		return fmt.Errorf("error on checking sessionToken authorization")
	} else {
		log.Trace("Session variables obtained successfully")
	}

	BrowserConnectionsMutex.Lock()
	browserConnection.BBBWebSessionVariables = sessionVariables
	BrowserConnectionsMutex.Unlock()

	return nil
}

func connectionInitHandler(
	browserConnection *common.BrowserConnection,
	fromBrowserToHasuraConnectionEstablishingChannel *common.SafeChannel) error {

	BrowserConnectionsMutex.RLock()
	browserConnectionId := browserConnection.Id
	browserConnectionCookies := browserConnection.BrowserRequestCookies
	BrowserConnectionsMutex.RUnlock()

	// Intercept the fromBrowserMessage channel to get the sessionToken
	for {
		fromBrowserMessage, ok := fromBrowserToHasuraConnectionEstablishingChannel.Receive()
		if !ok {
			//Received all messages. Channel is closed
			return fmt.Errorf("error on receiving init connection")
		}
		var fromBrowserMessageAsMap = fromBrowserMessage.(map[string]interface{})

		if fromBrowserMessageAsMap["type"] == "connection_init" {
			var payloadAsMap = fromBrowserMessageAsMap["payload"].(map[string]interface{})
			var headersAsMap = payloadAsMap["headers"].(map[string]interface{})
			var sessionToken, existsSessionToken = headersAsMap["X-Session-Token"].(string)
			if !existsSessionToken {
				return fmt.Errorf("X-Session-Token header missing on init connection")
			}

			var clientSessionUUID, existsClientSessionUUID = headersAsMap["X-ClientSessionUUID"].(string)
			if !existsClientSessionUUID {
				return fmt.Errorf("X-ClientSessionUUID header missing on init connection")
			}

			var clientType, existsClientType = headersAsMap["X-ClientType"].(string)
			if !existsClientType {
				return fmt.Errorf("X-ClientType header missing on init connection")
			}

			var clientIsMobile, existsMobile = headersAsMap["X-ClientIsMobile"].(string)
			if !existsMobile {
				return fmt.Errorf("X-ClientIsMobile header missing on init connection")
			}

			// Check authorization
			sessionVariables, err := bbb_web.BBBWebClient(browserConnectionId, sessionToken, browserConnectionCookies)
			if err != nil {
				log.Error(err)
				return fmt.Errorf("error on checking sessionToken authorization")
			} else {
				log.Trace("Session variables obtained successfully")
			}

			log.Debugf("[ConnectionInitHandler] intercepted Session Token %v and Client Session UUID %v", sessionToken, clientSessionUUID)
			BrowserConnectionsMutex.Lock()
			browserConnection.SessionToken = sessionToken
			browserConnection.ClientSessionUUID = clientSessionUUID
			browserConnection.BBBWebSessionVariables = sessionVariables
			browserConnection.ConnectionInitMessage = fromBrowserMessageAsMap
			BrowserConnectionsMutex.Unlock()

			go SendUserGraphqlConnectionEstablishedSysMsg(
				sessionToken,
				clientSessionUUID,
				clientType,
				strings.ToLower(clientIsMobile) == "true",
				browserConnectionId,
			)
			fromBrowserToHasuraConnectionEstablishingChannel.Close()
			break
		}
	}

	return nil
}
