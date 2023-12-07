package websrv

import (
	"context"
	"fmt"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/iMDT/bbb-graphql-middleware/internal/hascli"
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

	c, err := websocket.Accept(w, r, &acceptOptions)
	if err != nil {
		log.Errorf("error: %v", err)
	}
	defer c.Close(websocket.StatusInternalError, "the sky is falling")

	var thisConnection = common.BrowserConnection{
		Id:                  browserConnectionId,
		ActiveSubscriptions: make(map[string]common.GraphQlSubscription, 1),
		Context:             browserConnectionContext,
	}

	BrowserConnectionsMutex.Lock()
	BrowserConnections[browserConnectionId] = &thisConnection
	BrowserConnectionsMutex.Unlock()

	defer func() {
		msgpatch.RemoveConnCacheDir(browserConnectionId)
		BrowserConnectionsMutex.Lock()
		sessionTokenRemoved := BrowserConnections[browserConnectionId].SessionToken
		delete(BrowserConnections, browserConnectionId)
		BrowserConnectionsMutex.Unlock()
		go SendUserGraphqlConnectionClosedSysMsg(sessionTokenRemoved, browserConnectionId)

		log.Infof("connection removed")
	}()

	// Log it
	log.Infof("connection accepted")

	// Create channels
	fromBrowserChannel1 := make(chan interface{}, bufferSize)
	fromBrowserChannel2 := common.NewSafeChannel(bufferSize)
	toBrowserChannel := make(chan interface{}, bufferSize)

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
					log.Debugf("created hasura client")
					if thisBrowserConnection != nil {
						hascli.HasuraClient(thisBrowserConnection, r.Cookies(), fromBrowserChannel1, toBrowserChannel)
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

	// Reads from browser connection, writes into fromBrowserChannel1 and fromBrowserChannel2
	go reader.BrowserConnectionReader(browserConnectionId, browserConnectionContext, c, fromBrowserChannel1, fromBrowserChannel2, []*sync.WaitGroup{&wgAll, &wgReader})
	go func() {
		wgReader.Wait()
		thisConnection.Disconnected = true
	}()

	// Reads from toBrowserChannel, writes to browser connection
	go writer.BrowserConnectionWriter(browserConnectionId, browserConnectionContext, c, toBrowserChannel, &wgAll)

	go ConnectionInitHandler(browserConnectionId, browserConnectionContext, fromBrowserChannel2, &wgAll)

	// Wait until all routines are finished
	wgAll.Wait()

}

func InvalidateSessionTokenConnections(sessionTokenToInvalidate string) {
	BrowserConnectionsMutex.RLock()
	for _, browserConnection := range BrowserConnections {
		if browserConnection.SessionToken == sessionTokenToInvalidate {
			if browserConnection.HasuraConnection != nil {
				log.Debugf("Processing invalidate request for sessionToken %v (hasura connection %v)", sessionTokenToInvalidate, browserConnection.HasuraConnection.Id)
				browserConnection.HasuraConnection.ContextCancelFunc()
				log.Debugf("Processed invalidate request for sessionToken %v (hasura connection %v)", sessionTokenToInvalidate, browserConnection.HasuraConnection.Id)

				go SendUserGraphqlConnectionInvalidatedEvtMsg(browserConnection.SessionToken)
			}
		}
	}
	BrowserConnectionsMutex.RUnlock()
}
