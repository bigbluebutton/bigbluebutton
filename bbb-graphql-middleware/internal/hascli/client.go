package hascli

import (
	"context"
	"fmt"
	"github.com/iMDT/bbb-graphql-middleware/internal/hascli/conn/reader"
	"github.com/iMDT/bbb-graphql-middleware/internal/hascli/conn/writer"
	log "github.com/sirupsen/logrus"
	"math"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"os"
	"sync"

	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"golang.org/x/xerrors"
	"nhooyr.io/websocket"
)

var lastHasuraConnectionId int
var hasuraEndpoint = os.Getenv("BBB_GRAPHQL_MIDDLEWARE_HASURA_WS")

// Hasura client connection
func HasuraClient(browserConnection *common.BrowserConnection, cookies []*http.Cookie, fromBrowserToHasuraChannel *common.SafeChannel, fromHasuraToBrowserChannel *common.SafeChannel) error {
	log := log.WithField("_routine", "HasuraClient").WithField("browserConnectionId", browserConnection.Id)

	// Obtain id for this connection
	lastHasuraConnectionId++
	hasuraConnectionId := "HC" + fmt.Sprintf("%010d", lastHasuraConnectionId)
	log = log.WithField("hasuraConnectionId", hasuraConnectionId)

	defer log.Debugf("finished")

	// Add sub-protocol
	var dialOptions websocket.DialOptions
	dialOptions.Subprotocols = append(dialOptions.Subprotocols, "graphql-ws")

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
	jar.SetCookies(parsedURL, cookies)
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
		Id:                     hasuraConnectionId,
		Browserconn:            browserConnection,
		Context:                hasuraConnectionContext,
		ContextCancelFunc:      hasuraConnectionContextCancel,
		MsgReceivingActiveChan: common.NewSafeChannel(1),
	}

	browserConnection.HasuraConnection = &thisConnection
	defer func() {
		browserConnection.HasuraConnection = nil

		//It's necessary to freeze the channel to avoid client trying to start subscriptions before Hasura connection is initialised
		//It will unfreeze after `connection_ack` is sent by Hasura
		fromBrowserToHasuraChannel.FreezeChannel()
	}()

	// Make the connection
	c, _, err := websocket.Dial(hasuraConnectionContext, hasuraEndpoint, &dialOptions)
	if err != nil {
		return xerrors.Errorf("error connecting to hasura: %v", err)
	}
	defer c.Close(websocket.StatusInternalError, "the sky is falling")

	c.SetReadLimit(math.MaxInt64 - 1)

	thisConnection.Websocket = c

	// Log the connection success
	log.Debugf("connected with Hasura")

	// Configure the wait group
	var wg sync.WaitGroup
	wg.Add(2)

	// Start routines

	// reads from browser, writes to hasura
	go writer.HasuraConnectionWriter(&thisConnection, fromBrowserToHasuraChannel, &wg, browserConnection.ConnectionInitMessage)

	// reads from hasura, writes to browser
	go reader.HasuraConnectionReader(&thisConnection, fromHasuraToBrowserChannel, fromBrowserToHasuraChannel, &wg)

	// Wait
	wg.Wait()

	return nil
}
