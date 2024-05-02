package websrv

import (
	"context"
	"fmt"
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
	acceptOptions.Subprotocols = append(acceptOptions.Subprotocols, "graphql-ws")
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
		Id:                   browserConnectionId,
		ActiveSubscriptions:  make(map[string]common.GraphQlSubscription, 1),
		Context:              browserConnectionContext,
		ConnAckSentToBrowser: false,
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
						hasura.HasuraClient(thisBrowserConnection, r.Cookies(), fromBrowserToHasuraChannel, fromHasuraToBrowserChannel)
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

						gql_actions.GraphqlActionsClient(thisBrowserConnection, r.Cookies(), fromBrowserToGqlActionsChannel, fromBrowserToHasuraChannel, fromHasuraToBrowserChannel)
					}
					time.Sleep(100 * time.Millisecond)
				}
			}
		}
	}()

	// Configure the wait group (to hold this routine execution until both are completed)
	var wgAll sync.WaitGroup
	wgAll.Add(3)

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

	// Reads from fromHasuraToBrowserChannel, writes to browser connection
	go writer.BrowserConnectionWriter(browserConnectionId, browserConnectionContext, browserWsConn, fromHasuraToBrowserChannel, &wgAll)

	go ConnectionInitHandler(browserConnectionId, browserConnectionContext, fromBrowserToHasuraConnectionEstablishingChannel, &wgAll)

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
