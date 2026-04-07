package hasura

import (
	"context"
	"fmt"
	"math"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"sync"
	"sync/atomic"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/hasura/conn/reader"
	"bbb-graphql-middleware/internal/hasura/conn/writer"

	"github.com/coder/websocket"

	"bbb-graphql-middleware/internal/common"

	"golang.org/x/xerrors"
)

var (
	lastHasuraConnectionId uint64
	hasuraEndpoint         = config.GetConfig().Hasura.Url
)

// Hasura client connection
func HasuraClient(
	browserConnection *common.BrowserConnection,
) error {
	// Obtain id for this connection
	id := atomic.AddUint64(&lastHasuraConnectionId, 1)
	hasuraConnectionId := "HC" + fmt.Sprintf("%010d", id)

	browserConnection.Logger = browserConnection.Logger.WithField("hasuraConnectionId", hasuraConnectionId)

	defer browserConnection.Logger.Debugf("finished")

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
	hasuraConnectionContext, hasuraConnectionContextCancel := context.WithCancel(browserConnection.Context)
	defer hasuraConnectionContextCancel()

	thisConnection := common.HasuraConnection{
		Id:                hasuraConnectionId,
		BrowserConn:       browserConnection,
		Context:           hasuraConnectionContext,
		ContextCancelFunc: hasuraConnectionContextCancel,
	}

	browserConnection.HasuraConnection = &thisConnection
	defer func() {
		// When Hasura sends an CloseError, it will forward the error to the browser and close the connection
		if thisConnection.WebsocketCloseError != nil {
			browserConnection.Logger.Infof("Closing browser connection because Hasura connection was closed, reason: %s", thisConnection.WebsocketCloseError.Reason)
			browserConnection.Websocket.Close(thisConnection.WebsocketCloseError.Code, thisConnection.WebsocketCloseError.Reason)
			browserConnection.ContextCancelFunc()
		}

		browserConnection.HasuraConnection = nil

		// It's necessary to freeze the channel to avoid client trying to start subscriptions before Hasura connection is initialised
		// It will unfreeze after `connection_ack` is sent by Hasura
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
	browserConnection.Logger.Info("connected with Hasura")

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
