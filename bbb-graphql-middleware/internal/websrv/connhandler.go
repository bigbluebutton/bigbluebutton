package websrv

import (
	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/akka_apps"
	"bbb-graphql-middleware/internal/bbb_web"
	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/gql_actions"
	"bbb-graphql-middleware/internal/hasura"
	"bbb-graphql-middleware/internal/websrv/reader"
	"bbb-graphql-middleware/internal/websrv/writer"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/prometheus/client_golang/prometheus"
	log "github.com/sirupsen/logrus"
	"net/http"
	"nhooyr.io/websocket"
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

	//Add Authorized Cross Origin Url
	if config.GetConfig().Server.AuthorizedCrossOrigin != "" {
		acceptOptions.OriginPatterns = append(acceptOptions.OriginPatterns, config.GetConfig().Server.AuthorizedCrossOrigin)
	}

	browserWsConn, err := websocket.Accept(w, r, &acceptOptions)
	browserWsConn.SetReadLimit(9999999) //10MB
	if err != nil {
		log.Errorf("error: %v", err)
	}

	if common.HasReachedMaxGlobalConnections() {
		common.WsConnectionRejectedCounter.With(prometheus.Labels{"reason": "limit of server connections exceeded"}).Inc()
		disconnectWithError(
			browserWsConn,
			browserConnectionContext,
			browserConnectionContextCancel,
			websocket.StatusInternalError,
			"connections_limit_exceeded",
			"limit of server connections exceeded")
		return
	}

	defer browserWsConn.Close(websocket.StatusInternalError, "the sky is falling")

	var thisConnection = common.BrowserConnection{
		Id:                             browserConnectionId,
		Websocket:                      browserWsConn,
		BrowserRequestCookies:          r.Cookies(),
		ActiveSubscriptions:            make(map[string]common.GraphQlSubscription, 1),
		Context:                        browserConnectionContext,
		ContextCancelFunc:              browserConnectionContextCancel,
		ConnAckSentToBrowser:           false,
		FromBrowserToHasuraChannel:     common.NewSafeChannelByte(bufferSize),
		FromBrowserToGqlActionsChannel: common.NewSafeChannelByte(bufferSize),
		FromHasuraToBrowserChannel:     common.NewSafeChannelByte(bufferSize),
	}

	BrowserConnectionsMutex.Lock()
	BrowserConnections[browserConnectionId] = &thisConnection
	BrowserConnectionsMutex.Unlock()

	defer func() {
		BrowserConnectionsMutex.Lock()
		_, bcExists := BrowserConnections[browserConnectionId]
		if bcExists {
			sessionTokenRemoved := BrowserConnections[browserConnectionId].SessionToken
			delete(BrowserConnections, browserConnectionId)

			if sessionTokenRemoved != "" {
				go SendUserGraphqlConnectionClosedSysMsg(sessionTokenRemoved, browserConnectionId)
			}
		}
		BrowserConnectionsMutex.Unlock()

		log.Infof("connection removed")
	}()

	// Log it
	log.Infof("connection accepted")

	// Configure the wait group (to hold this routine execution until both are completed)
	var wgAll sync.WaitGroup
	wgAll.Add(2)

	// Other wait group to close this connection once Browser Reader dies
	var wgReader sync.WaitGroup
	wgReader.Add(1)

	// Reads from browser connection, writes into fromBrowserToHasuraChannel
	go reader.BrowserConnectionReader(&thisConnection, []*sync.WaitGroup{&wgAll, &wgReader})

	go func() {
		wgReader.Wait()
		log.Debug("BrowserConnectionReader finished, closing Write Channel")
		thisConnection.FromHasuraToBrowserChannel.Close()
		thisConnection.Disconnected = true
	}()

	//Check authorization and obtain user session variables from bbb-web
	if errorOnInitConnection, errorMessageId := connectionInitHandler(&thisConnection); errorOnInitConnection != nil {
		common.WsConnectionRejectedCounter.With(prometheus.Labels{"reason": errorOnInitConnection.Error()}).Inc()
		disconnectWithError(
			browserWsConn,
			browserConnectionContext,
			browserConnectionContextCancel,
			//If the server wishes to reject the connection it is recommended to close the socket with `4403: Forbidden`.
			//https://github.com/enisdenjo/graphql-ws/blob/63881c3372a3564bf42040e3f572dd74e41b2e49/PROTOCOL.md?plain=1#L36
			websocket.StatusCode(4403),
			errorMessageId,
			errorOnInitConnection.Error())
	}

	common.WsConnectionAcceptedCounter.Inc()

	common.AddUserConnection(thisConnection.SessionToken)
	defer common.RemoveUserConnection(thisConnection.SessionToken)

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
						hasura.HasuraClient(thisBrowserConnection)
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

						gql_actions.GraphqlActionsClient(thisBrowserConnection)
					}
					time.Sleep(1000 * time.Millisecond)
				}
			}
		}
	}()

	// Reads from fromHasuraToBrowserChannel, writes to browser connection
	go writer.BrowserConnectionWriter(&thisConnection, &wgAll)

	// Wait until all routines are finished
	wgAll.Wait()
}

func InvalidateSessionTokenHasuraConnections(sessionTokenToInvalidate string) {
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
	BrowserConnectionsMutex.RLock()
	defer BrowserConnectionsMutex.RUnlock()

	if bc.HasuraConnection == nil {
		return // If there's no Hasura connection, there's nothing to invalidate.
	}

	log.Debugf("Processing reconnection request for sessionToken %v (hasura connection %v)", sessionToken, bc.HasuraConnection.Id)

	// Stop receiving new messages from the browser.
	log.Debug("freezing channel fromBrowserToHasuraChannel")
	bc.FromBrowserToHasuraChannel.FreezeChannel()

	//Update variables for Mutations (gql-actions requests)
	go refreshUserSessionVariables(bc)

	// Cancel the Hasura connection context to clean up resources.
	if bc.HasuraConnection != nil && bc.HasuraConnection.ContextCancelFunc != nil {
		bc.HasuraConnection.ContextCancelFunc()
	}

	// Send a reconnection confirmation message
	go SendUserGraphqlReconnectionForcedEvtMsg(sessionToken)
}

func InvalidateSessionTokenBrowserConnections(sessionTokenToInvalidate string, reasonMsgId string, reason string) {
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
			invalidateBrowserConnectionForSessionToken(bc, sessionTokenToInvalidate, reasonMsgId, reason)
		}(browserConnection)
	}
	wg.Wait()
}

func invalidateBrowserConnectionForSessionToken(bc *common.BrowserConnection, sessionToken string, reasonMsgId string, reason string) {
	BrowserConnectionsMutex.RLock()
	defer BrowserConnectionsMutex.RUnlock()

	log.Debugf("Processing disconnection request for sessionToken %v (browser connection %v)", sessionToken, bc.Id)

	// Stop receiving new messages from the browser.
	log.Debug("freezing channel fromBrowserToHasuraChannel")
	bc.FromBrowserToHasuraChannel.FreezeChannel()

	disconnectWithError(
		bc.Websocket,
		bc.Context,
		bc.ContextCancelFunc,
		websocket.StatusCode(4403),
		reasonMsgId,
		reason)

	// Send a reconnection confirmation message
	go SendUserGraphqlDisconnectionForcedEvtMsg(sessionToken)
}

func refreshUserSessionVariables(browserConnection *common.BrowserConnection) (error, string) {
	BrowserConnectionsMutex.RLock()
	sessionToken := browserConnection.SessionToken
	browserConnectionId := browserConnection.Id
	BrowserConnectionsMutex.RUnlock()

	// Check authorization
	sessionVariables, err, errorId := akka_apps.AkkaAppsGetSessionVariablesFrom(browserConnectionId, sessionToken)
	if err != nil {
		log.Error(err)
		return fmt.Errorf("error on checking sessionToken authorization: %s", err.Error()), errorId
	} else {
		log.Trace("Session variables obtained successfully")
	}

	if _, exists := sessionVariables["x-hasura-role"]; !exists {
		return fmt.Errorf("error on checking sessionToken authorization, X-Hasura-Role is missing"), "param_missing"
	}

	if _, exists := sessionVariables["x-hasura-userid"]; !exists {
		return fmt.Errorf("error on checking sessionToken authorization, X-Hasura-UserId is missing"), "param_missing"
	}

	if _, exists := sessionVariables["x-hasura-meetingid"]; !exists {
		return fmt.Errorf("error on checking sessionToken authorization, X-Hasura-MeetingId is missing"), "param_missing"
	}

	BrowserConnectionsMutex.Lock()
	browserConnection.BBBWebSessionVariables = sessionVariables
	BrowserConnectionsMutex.Unlock()

	return nil, ""
}

func connectionInitHandler(browserConnection *common.BrowserConnection) (error, string) {
	BrowserConnectionsMutex.RLock()
	browserConnectionId := browserConnection.Id
	browserConnectionCookies := browserConnection.BrowserRequestCookies
	BrowserConnectionsMutex.RUnlock()

	// Intercept the fromBrowserMessage channel to get the sessionToken
	for {
		fromBrowserMessage, ok := browserConnection.FromBrowserToHasuraChannel.Receive()
		if !ok {
			//Received all messages. Channel is closed
			return fmt.Errorf("error on receiving init connection"), "param_missing"
		}
		if bytes.Contains(fromBrowserMessage, []byte("\"connection_init\"")) {
			var fromBrowserMessageAsMap map[string]interface{}
			if err := json.Unmarshal(fromBrowserMessage, &fromBrowserMessageAsMap); err != nil {
				log.Errorf("failed to unmarshal message: %v", err)
				continue
			}

			var payloadAsMap = fromBrowserMessageAsMap["payload"].(map[string]interface{})
			var headersAsMap = payloadAsMap["headers"].(map[string]interface{})
			var sessionToken, existsSessionToken = headersAsMap["X-Session-Token"].(string)
			if !existsSessionToken {
				return fmt.Errorf("X-Session-Token header missing on init connection"), "param_missing"
			}

			if common.HasReachedMaxUserConnections(sessionToken) {
				return fmt.Errorf("too many connections"), "too_many_connections"
			}

			var clientSessionUUID, existsClientSessionUUID = headersAsMap["X-ClientSessionUUID"].(string)
			if !existsClientSessionUUID {
				return fmt.Errorf("X-ClientSessionUUID header missing on init connection"), "param_missing"
			}

			var clientType, existsClientType = headersAsMap["X-ClientType"].(string)
			if !existsClientType {
				return fmt.Errorf("X-ClientType header missing on init connection"), "param_missing"
			}

			var clientIsMobile, existsMobile = headersAsMap["X-ClientIsMobile"].(string)
			if !existsMobile {
				return fmt.Errorf("X-ClientIsMobile header missing on init connection"), "param_missing"
			}

			var meetingId, userId string
			var errCheckAuthorization error

			// Check authorization
			var numOfAttempts = 0
			for {
				meetingId, userId, errCheckAuthorization = bbb_web.BBBWebCheckAuthorization(browserConnectionId, sessionToken, browserConnectionCookies)
				if errCheckAuthorization != nil {
					log.Error(errCheckAuthorization)
				}

				if (errCheckAuthorization == nil && meetingId != "" && userId != "") || numOfAttempts > 5 {
					break
				}
				numOfAttempts++
				time.Sleep(100 * time.Millisecond)
			}

			if errCheckAuthorization != nil {
				return fmt.Errorf("error on trying to check authorization"), "user_not_found"
			}

			if meetingId == "" {
				return fmt.Errorf("error on trying to check authorization"), "user_not_found"
			}

			if userId == "" {
				return fmt.Errorf("error on trying to check authorization"), "user_not_found"
			}

			log.Trace("Success on check authorization")

			log.Debugf("[ConnectionInitHandler] intercepted Session Token %v and Client Session UUID %v", sessionToken, clientSessionUUID)
			BrowserConnectionsMutex.Lock()
			browserConnection.SessionToken = sessionToken
			browserConnection.ClientSessionUUID = clientSessionUUID
			browserConnection.MeetingId = meetingId
			browserConnection.UserId = userId
			browserConnection.ConnectionInitMessage = fromBrowserMessage
			BrowserConnectionsMutex.Unlock()

			if err, errorId := refreshUserSessionVariables(browserConnection); err != nil {
				return err, errorId
			}

			go SendUserGraphqlConnectionEstablishedSysMsg(
				sessionToken,
				clientSessionUUID,
				clientType,
				strings.ToLower(clientIsMobile) == "true",
				browserConnectionId,
			)

			break
		}
	}

	return nil, ""
}

func disconnectWithError(
	browserConnectionWs *websocket.Conn,
	browserConnectionContext context.Context,
	browserConnectionContextCancel context.CancelFunc,
	wsCloseStatusCode websocket.StatusCode,
	reasonMessageId string,
	reasonMessage string) {

	//Chromium-based browsers can't read websocket close code/reason, so it will send this message before closing conn
	browserResponseData := map[string]interface{}{
		"id":   "-1", //The client recognizes this message ID as a signal to terminate the session
		"type": "error",
		"payload": []interface{}{
			map[string]interface{}{
				"messageId": reasonMessageId,
				"message":   reasonMessage,
			},
		},
	}
	jsonData, _ := json.Marshal(browserResponseData)

	log.Tracef("sending to browser: %s", string(jsonData))
	err := browserConnectionWs.Write(browserConnectionContext, websocket.MessageText, jsonData)
	if err != nil {
		log.Debugf("Browser is disconnected, skipping writing of ws message: %v", err)
	}

	errCloseWs := browserConnectionWs.Close(wsCloseStatusCode, reasonMessage)
	if errCloseWs != nil {
		log.Debugf("Error on close websocket: %v", errCloseWs)
	}
	
	browserConnectionContextCancel()

	return
}
