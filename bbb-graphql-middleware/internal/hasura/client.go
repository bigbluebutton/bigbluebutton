package hasura

import (
	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/hasura/conn/reader"
	"bbb-graphql-middleware/internal/hasura/conn/writer"
	"context"
	"fmt"
	log "github.com/sirupsen/logrus"
	"math"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"sync"

	"bbb-graphql-middleware/internal/common"
	"golang.org/x/xerrors"
	"nhooyr.io/websocket"
)

var lastHasuraConnectionId int
var hasuraEndpoint = config.GetConfig().Hasura.Url

// Hasura client connection
func HasuraClient(
	browserConnection *common.BrowserConnection) error {
	log := log.WithField("_routine", "HasuraClient").WithField("browserConnectionId", browserConnection.Id)

	// Obtain id for this connection
	lastHasuraConnectionId++
	hasuraConnectionId := "HC" + fmt.Sprintf("%010d", lastHasuraConnectionId)
	log = log.WithField("hasuraConnectionId", hasuraConnectionId)

	defer log.Debugf("finished")

	// Add sub-protocol
	var dialOptions websocket.DialOptions
	dialOptions.Subprotocols = append(dialOptions.Subprotocols, "graphql-transport-ws")

	// Create cookie jar
	jar, err := cookiejar.New(nil)
	if err != nil {
		return xerrors.Errorf("failed to create cookie jar: %w", err)
	}
	parsedURL, err := url.Parse(hasuraEndpoint)
	if err != nil {
		return xerrors.Errorf("failed to parse url: %w", err)
	}
	parsedURL.Scheme = "http"
	jar.SetCookies(parsedURL, browserConnection.BrowserRequestCookies)
	hc := &http.Client{
		Jar: jar,
	}
	dialOptions.HTTPClient = hc

	// Create a context for the hasura connection, that depends on the browser context
	// this means that if browser connection is closed, the hasura connection will close also
	// this also means that we can close the hasura connection without closing the browser one
	// this is used for the invalidation process (reconnection only on the hasura side )
	var hasuraConnectionContext, hasuraConnectionContextCancel = context.WithCancel(browserConnection.Context)
	defer hasuraConnectionContextCancel()

	var thisConnection = common.HasuraConnection{
		Id:                hasuraConnectionId,
		BrowserConn:       browserConnection,
		Context:           hasuraConnectionContext,
		ContextCancelFunc: hasuraConnectionContextCancel,
	}

	browserConnection.HasuraConnection = &thisConnection
	defer func() {
		//When Hasura sends an CloseError, it will forward the error to the browser and close the connection
		if thisConnection.WebsocketCloseError != nil {
			browserConnection.Websocket.Close(thisConnection.WebsocketCloseError.Code, thisConnection.WebsocketCloseError.Reason)
			browserConnection.ContextCancelFunc()
		}

		browserConnection.HasuraConnection = nil

		//It's necessary to freeze the channel to avoid client trying to start subscriptions before Hasura connection is initialised
		//It will unfreeze after `connection_ack` is sent by Hasura
		browserConnection.FromBrowserToHasuraChannel.FreezeChannel()
	}()

	// Make the connection
	hasuraWsConn, _, err := websocket.Dial(hasuraConnectionContext, hasuraEndpoint, &dialOptions)
	if err != nil {
		return xerrors.Errorf("error connecting to hasura: %v", err)
	}
	defer hasuraWsConn.Close(websocket.StatusInternalError, "the sky is falling")

	hasuraWsConn.SetReadLimit(math.MaxInt64 - 1)

	thisConnection.Websocket = hasuraWsConn

	// Log the connection success
	log.Debugf("connected with Hasura")

	// Configure the wait group
	var wg sync.WaitGroup
	wg.Add(2)

	// Start routines

	// reads from browser, writes to hasura
	go writer.HasuraConnectionWriter(&thisConnection, &wg, browserConnection.ConnectionInitMessage)

	// reads from hasura, writes to browser
	go reader.HasuraConnectionReader(&thisConnection, &wg)

	// Wait
	wg.Wait()

	return nil
}
