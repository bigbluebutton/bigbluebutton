package websrv

import (
	"context"
	"fmt"
	"github.com/iMDT/bbb-graphql-middleware/internal/websrv/reader"
	"github.com/iMDT/bbb-graphql-middleware/internal/websrv/writer"
	log "github.com/sirupsen/logrus"
	"net/http"
	"sync"
	"time"

	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/iMDT/bbb-graphql-middleware/internal/hascli"
	"nhooyr.io/websocket"
)

var lastBrowserConnectionId int

// Buffer size of the channels
var bufferSize = 100

// active browser connections
var BrowserConnections = make(map[string]*common.BrowserConnection)
var BrowserConnectionsMutex = &sync.Mutex{}

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
		BrowserConnectionsMutex.Lock()
		delete(BrowserConnections, browserConnectionId)
		BrowserConnectionsMutex.Unlock()
	}()

	// Log it
	log.Printf("connection accepted")

	// Create channels
	fromBrowserChannel1 := make(chan interface{}, bufferSize)
	fromBrowserChannel2 := make(chan interface{}, bufferSize)
	toBrowserChannel := make(chan interface{}, bufferSize)

	// Ensure a hasura client is running while the browser is connected
	go func() {
		log.Printf("starting hasura client")

	BrowserConnectedLoop:
		for {
			select {
			case <-browserConnectionContext.Done():
				break BrowserConnectedLoop
			default:
				{
					log.Printf("creating hasura client")
					BrowserConnectionsMutex.Lock()
					thisBrowserConnection := BrowserConnections[browserConnectionId]
					BrowserConnectionsMutex.Unlock()
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

	go SessionTokenReader(browserConnectionId, browserConnectionContext, fromBrowserChannel2, &wgAll)

	// Wait until all routines are finished
	wgAll.Wait()

}
