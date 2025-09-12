package websrv

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/akka_apps"
	"bbb-graphql-middleware/internal/bbb_web"
	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/gql_actions"
	"bbb-graphql-middleware/internal/hasura"
	"bbb-graphql-middleware/internal/websrv/reader"
	"bbb-graphql-middleware/internal/websrv/writer"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/sirupsen/logrus"
	"golang.org/x/time/rate"
	"nhooyr.io/websocket"
)

var lastBrowserConnectionId atomic.Int64

// Buffer size of the channels
var bufferSize = 100

// active browser connections
var (
	BrowserConnections      = make(map[string]*common.BrowserConnection)
	BrowserConnectionsMutex = &sync.RWMutex{}
)

// Handle client connection
// This is the connection that comes from browser
func ConnectionHandler(w http.ResponseWriter, r *http.Request) {
	// Configure logger
	newLogger := logrus.New()
	cfg := config.GetConfig()
	if logLevelFromConfig, err := logrus.ParseLevel(cfg.LogLevel); err == nil {
		newLogger.SetLevel(logLevelFromConfig)
		if logLevelFromConfig > logrus.InfoLevel {
			newLogger.SetReportCaller(true)
		}
	} else {
		newLogger.SetLevel(logrus.InfoLevel)
	}
	newLogger.SetFormatter(&logrus.JSONFormatter{})

	// Obtain id for this connection
	lastBrowserConnectionId.Add(1)
	browserConnectionId := "BC" + fmt.Sprintf("%010d", lastBrowserConnectionId.Load())
	connectionLogger := newLogger.WithField("browserConnectionId", browserConnectionId)

	// Starts a context that will be dependent on the connection, so we can cancel subroutines when the connection is dropped
	browserConnectionContext, browserConnectionContextCancel := context.WithCancel(r.Context())
	defer browserConnectionContextCancel()

	// Add sub-protocol
	var acceptOptions websocket.AcceptOptions
	acceptOptions.Subprotocols = append(acceptOptions.Subprotocols, "graphql-transport-ws")

	// Add Authorized Cross Origin Url
	if config.GetConfig().Server.AuthorizedCrossOrigin != "" {
		acceptOptions.OriginPatterns = append(acceptOptions.OriginPatterns, config.GetConfig().Server.AuthorizedCrossOrigin)
	}

	browserWsConn, err := websocket.Accept(w, r, &acceptOptions)
	if err != nil {
		connectionLogger.Errorf("error: %v", err)
		http.Error(w, "Closing browser connection, reason: request Origin is not authorized", http.StatusForbidden)
		return
	}
	browserWsConn.SetReadLimit(9999999) // 10MB

	if common.HasReachedMaxGlobalConnections() {
		common.WsConnectionRejectedCounter.With(prometheus.Labels{"reason": "limit of server connections exceeded"}).Inc()
		disconnectWithError(
			browserWsConn,
			browserConnectionContext,
			browserConnectionContextCancel,
			websocket.StatusInternalError,
			"connections_limit_exceeded",
			"limit of server connections exceeded",
			connectionLogger)
		return
	}

	defer browserWsConn.Close(websocket.StatusInternalError, "the sky is falling")

	thisConnection := common.BrowserConnection{
		Id:                                 browserConnectionId,
		Websocket:                          browserWsConn,
		BrowserRequestCookies:              r.Cookies(),
		ActiveSubscriptions:                make(map[string]common.GraphQlSubscription, 1),
		ActiveStreamings:                   make(map[string]string, 1),
		Context:                            browserConnectionContext,
		ContextCancelFunc:                  browserConnectionContextCancel,
		ConnAckSentToBrowser:               false,
		FromBrowserToHasuraChannel:         common.NewSafeChannelByte(bufferSize),
		FromBrowserToHasuraRateLimiter:     rate.NewLimiter(rate.Every(time.Minute/time.Duration(cfg.Server.MaxConnectionQueriesPerMinute)), cfg.Server.MaxConnectionQueriesPerMinute),
		FromBrowserToGqlActionsChannel:     common.NewSafeChannelByte(bufferSize),
		FromBrowserToGqlActionsRateLimiter: rate.NewLimiter(rate.Every(time.Minute/time.Duration(cfg.Server.MaxConnectionMutationsPerMinute)), cfg.Server.MaxConnectionMutationsPerMinute),
		FromHasuraToBrowserChannel:         common.NewSafeChannelByte(bufferSize),
		LastBrowserMessageTime:             time.Now(),
		Logger:                             connectionLogger,
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

		thisConnection.Logger.Infof("browser connection removed")
	}()

	thisConnection.Logger.Infof("browser connection accepted")

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
		thisConnection.Logger.Debug("BrowserConnectionReader finished, closing Write Channel")
		thisConnection.FromHasuraToBrowserChannel.Close()
		thisConnection.Disconnected = true
	}()

	// Check authorization and obtain user session variables from bbb-web
	if errorOnInitConnection, errorMessageId := connectionInitHandler(&thisConnection); errorOnInitConnection != nil {
		common.WsConnectionRejectedCounter.With(prometheus.Labels{"reason": errorOnInitConnection.Error()}).Inc()
		disconnectWithError(
			browserWsConn,
			browserConnectionContext,
			browserConnectionContextCancel,
			// If the server wishes to reject the connection it is recommended to close the socket with `4403: Forbidden`.
			// https://github.com/enisdenjo/graphql-ws/blob/63881c3372a3564bf42040e3f572dd74e41b2e49/PROTOCOL.md?plain=1#L36
			websocket.StatusCode(4403),
			errorMessageId,
			errorOnInitConnection.Error(),
			connectionLogger)
	}

	common.WsConnectionAcceptedCounter.Inc()

	common.AddUserConnection(thisConnection.SessionToken)
	defer common.RemoveUserConnection(thisConnection.SessionToken)

	// Ensure a hasura client is running while the browser is connected
	go func() {
		thisConnection.Logger.Debugf("starting hasura client")

	BrowserConnectedLoop:
		for {
			select {
			case <-browserConnectionContext.Done():
				break BrowserConnectedLoop
			default:
				{
					thisConnection.Logger.Debugf("creating hasura client")
					BrowserConnectionsMutex.RLock()
					thisBrowserConnection := BrowserConnections[browserConnectionId]
					BrowserConnectionsMutex.RUnlock()
					if thisBrowserConnection != nil {
						thisConnection.Logger.Debugf("created hasura client")
						hasura.HasuraClient(thisBrowserConnection)
					}
					time.Sleep(100 * time.Millisecond)
				}
			}
		}
	}()

	// Ensure a gql-actions client is running while the browser is connected
	go func() {
		thisConnection.Logger.Debugf("starting gql-actions client")

	BrowserConnectedLoop:
		for {
			select {
			case <-browserConnectionContext.Done():
				break BrowserConnectedLoop
			default:
				{
					thisConnection.Logger.Debugf("creating gql-actions client")
					BrowserConnectionsMutex.RLock()
					thisBrowserConnection := BrowserConnections[browserConnectionId]
					BrowserConnectionsMutex.RUnlock()
					if thisBrowserConnection != nil {
						thisConnection.Logger.Debugf("created gql-actions client")

						thisBrowserConnection.Lock()
						thisBrowserConnection.GraphqlActionsContext, thisBrowserConnection.GraphqlActionsContextCancel = context.WithCancel(browserConnectionContext)
						thisBrowserConnection.Unlock()

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
	bc.RLock()
	defer bc.RUnlock()

	if bc.HasuraConnection == nil {
		return // If there's no Hasura connection, there's nothing to invalidate.
	}

	bc.Logger.Debugf("Processing invalidate request for sessionToken %v (hasura connection %v)", sessionToken, bc.HasuraConnection.Id)

	// Stop receiving new messages from the browser.
	bc.Logger.Debug("freezing channel fromBrowserToHasuraChannel")
	bc.FromBrowserToHasuraChannel.FreezeChannel()

	// Update variables for Mutations (gql-actions requests)
	go refreshUserSessionVariables(bc)

	// Cancel the Hasura connection context to clean up resources.
	if bc.HasuraConnection != nil && bc.HasuraConnection.ContextCancelFunc != nil {
		bc.HasuraConnection.ContextCancelFunc()
	}

	// Send a reconnection confirmation message
	// stop sending this message as no application is handling it
	// go SendUserGraphqlReconnectionForcedEvtMsg(sessionToken)
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
	bc.RLock()
	defer bc.RUnlock()

	bc.Logger.Debugf("Processing disconnection request for sessionToken %v (browser connection %v)", sessionToken, bc.Id)

	// Stop receiving new messages from the browser.
	bc.Logger.Debug("freezing channel fromBrowserToHasuraChannel")
	bc.FromBrowserToHasuraChannel.FreezeChannel()

	disconnectWithError(
		bc.Websocket,
		bc.Context,
		bc.ContextCancelFunc,
		websocket.StatusCode(4403),
		reasonMsgId,
		reason,
		bc.Logger)

	// Send a reconnection confirmation message
	go SendUserGraphqlDisconnectionForcedEvtMsg(sessionToken)
}

func refreshUserSessionVariables(browserConnection *common.BrowserConnection) (error, string) {
	// Check authorization
	sessionVariables, err, errorId := akka_apps.AkkaAppsGetSessionVariablesFrom(browserConnection.Id, browserConnection.SessionToken, browserConnection.ClientSessionUUID)
	if err != nil {
		browserConnection.Logger.Error(err)
		return fmt.Errorf("error on checking sessionToken authorization: %s", err.Error()), errorId
	} else {
		browserConnection.Logger.Trace("Session variables obtained successfully")
	}

	hasuraRole, existsHasuraRole := sessionVariables["x-hasura-role"]
	if !existsHasuraRole {
		return fmt.Errorf("error on checking sessionToken authorization, X-Hasura-Role is missing"), "param_missing"
	}

	if _, exists := sessionVariables["x-hasura-userid"]; !exists {
		return fmt.Errorf("error on checking sessionToken authorization, X-Hasura-UserId is missing"), "param_missing"
	}

	browserConnection.Lock()
	browserConnection.BBBWebSessionVariables = sessionVariables
	browserConnection.CurrentlyInMeeting = hasuraRole == "bbb_client"
	browserConnection.BBBWebSessionVariables = sessionVariables
	browserConnection.Unlock()

	return nil, ""
}

func connectionInitHandler(browserConnection *common.BrowserConnection) (error, string) {
	// Intercept the fromBrowserMessage channel to get the sessionToken
	for {
		fromBrowserMessage, ok := browserConnection.FromBrowserToHasuraChannel.Receive()
		if !ok {
			// Received all messages. Channel is closed
			return fmt.Errorf("error on receiving init connection"), "param_missing"
		}
		if bytes.Contains(fromBrowserMessage, []byte("\"connection_init\"")) {
			var fromBrowserMessageAsMap map[string]interface{}
			if err := json.Unmarshal(fromBrowserMessage, &fromBrowserMessageAsMap); err != nil {
				browserConnection.Logger.Errorf("failed to unmarshal message: %v", err)
				continue
			}

			payloadAsMap := fromBrowserMessageAsMap["payload"].(map[string]interface{})
			headersAsMap := payloadAsMap["headers"].(map[string]interface{})
			sessionToken, existsSessionToken := headersAsMap["X-Session-Token"].(string)
			if !existsSessionToken {
				return fmt.Errorf("X-Session-Token header missing on init connection"), "param_missing"
			}
			browserConnection.Logger = browserConnection.Logger.WithField("sessionToken", sessionToken)

			if common.HasReachedMaxUserConnections(sessionToken) {
				return fmt.Errorf("too many connections"), "too_many_connections"
			}

			clientSessionUUID, existsClientSessionUUID := headersAsMap["X-ClientSessionUUID"].(string)
			if !existsClientSessionUUID {
				return fmt.Errorf("X-ClientSessionUUID header missing on init connection"), "param_missing"
			}
			browserConnection.Logger = browserConnection.Logger.WithField("clientSessionUUID", clientSessionUUID)

			clientType, existsClientType := headersAsMap["X-ClientType"].(string)
			if !existsClientType {
				return fmt.Errorf("X-ClientType header missing on init connection"), "param_missing"
			}

			clientIsMobile, existsMobile := headersAsMap["X-ClientIsMobile"].(string)
			if !existsMobile {
				return fmt.Errorf("X-ClientIsMobile header missing on init connection"), "param_missing"
			}

			var meetingId, userId string
			var errCheckAuthorization error

			// Check authorization
			numOfAttempts := 0
			for {
				meetingId, userId, errCheckAuthorization = bbb_web.BBBWebCheckAuthorization(browserConnection.Id, sessionToken, clientSessionUUID, browserConnection.BrowserRequestCookies)
				if errCheckAuthorization != nil {
					browserConnection.Logger.Error(errCheckAuthorization)
				}

				if (errCheckAuthorization == nil && meetingId != "" && userId != "") || numOfAttempts > 5 {
					break
				}
				numOfAttempts++
				time.Sleep(100 * time.Millisecond)
			}

			if errCheckAuthorization != nil {
				return fmt.Errorf("error on trying to check authorization"), "check_authorization_error"
			}

			if meetingId == "" {
				return fmt.Errorf("error on trying to check authorization"), "meeting_not_found"
			}
			browserConnection.Logger = browserConnection.Logger.WithField("meetingId", meetingId)

			if userId == "" {
				return fmt.Errorf("error on trying to check authorization"), "user_not_found"
			}
			browserConnection.Logger = browserConnection.Logger.WithField("userId", userId)

			browserConnection.Logger.Trace("Success on check authorization")

			browserConnection.Logger.Debugf("[ConnectionInitHandler] intercepted Session Token %v and Client Session UUID %v", sessionToken, clientSessionUUID)
			browserConnection.Lock()
			browserConnection.SessionToken = sessionToken
			browserConnection.ClientSessionUUID = clientSessionUUID
			browserConnection.MeetingId = meetingId
			browserConnection.UserId = userId
			browserConnection.ConnectionInitMessage = fromBrowserMessage
			browserConnection.Unlock()

			if err, errorId := refreshUserSessionVariables(browserConnection); err != nil {
				return err, errorId
			}

			go SendUserGraphqlConnectionEstablishedSysMsg(
				sessionToken,
				clientSessionUUID,
				clientType,
				strings.ToLower(clientIsMobile) == "true",
				browserConnection.Id,
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
	reasonMessage string,
	logger *logrus.Entry,
) {
	// Chromium-based browsers can't read websocket close code/reason, so it will send this message before closing conn
	browserResponseData := map[string]interface{}{
		"id":   "-1", // The client recognizes this message ID as a signal to terminate the session
		"type": "error",
		"payload": []interface{}{
			map[string]interface{}{
				"messageId": reasonMessageId,
				"message":   reasonMessage,
			},
		},
	}
	jsonData, _ := json.Marshal(browserResponseData)

	logger.Tracef("sending to browser: %s", string(jsonData))
	logger.Infof("deliberately disconnecting browser with error, reason: %s (%s)", reasonMessage, reasonMessageId)

	err := browserConnectionWs.Write(browserConnectionContext, websocket.MessageText, jsonData)
	if err != nil {
		logger.Debugf("Browser is disconnected, skipping writing of ws message: %v", err)
	}

	errCloseWs := browserConnectionWs.Close(wsCloseStatusCode, reasonMessage)
	if errCloseWs != nil {
		logger.Debugf("Error on close websocket: %v", errCloseWs)
	}

	browserConnectionContextCancel()

	return
}

var websocketIdleTimeoutSeconds = config.GetConfig().Server.WebsocketIdleTimeoutSeconds

func InvalidateIdleBrowserConnectionsRoutine() {
	for {
		time.Sleep(15 * time.Second)

		BrowserConnectionsMutex.RLock()
		for _, browserConnection := range BrowserConnections {
			browserConnection.RLock()
			browserIdleSince := time.Since(browserConnection.LastBrowserMessageTime)
			browserConnection.RUnlock()

			if browserIdleSince > time.Duration(websocketIdleTimeoutSeconds)*time.Second {
				browserConnection.Logger.Info("Closing browser connection, reason: idle timeout")
				errCloseWs := browserConnection.Websocket.Close(websocket.StatusNormalClosure, "idle timeout")
				if errCloseWs != nil {
					browserConnection.Logger.Debugf("Error on close websocket: %v", errCloseWs)
				}
			}
		}
		BrowserConnectionsMutex.RUnlock()
	}
}
