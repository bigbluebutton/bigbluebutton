package reader

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"slices"
	"sync"
	"time"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
	streamingserver "bbb-graphql-middleware/internal/streaming_server"

	"github.com/coder/websocket"
)

// Derived from the canonical list rather than hand-maintained, so a stream cannot be added to one
// place and forgotten in the other. Only a document the reader does not decide from the parse is
// routed on these patterns.
var streamingHandleByMiddlewarePatterns = func() [][]byte {
	patterns := make([][]byte, 0, len(config.StreamingSubscriptionsManagedByMiddleware))
	for _, operationName := range config.StreamingSubscriptionsManagedByMiddleware {
		patterns = append(patterns, []byte("\"query\":\"subscription "+operationName))
	}

	return patterns
}()

func BrowserConnectionReader(
	browserConnection *common.BrowserConnection,
	waitGroups []*sync.WaitGroup,
) {
	defer browserConnection.Logger.Debugf("finished")
	browserConnection.Logger.Debugf("starting")

	defer func() {
		browserConnection.FromBrowserToHasuraChannel.Close()
		browserConnection.FromBrowserToGqlActionsChannel.Close()
	}()

	defer func() {
		// Let other routines know this is about to die
		for _, wg := range waitGroups {
			wg.Done()
		}
		// Wait a little bit before closing the channels
		time.Sleep(100 * time.Millisecond)
	}()

	defer browserConnection.ContextCancelFunc()

	for {
		messageType, message, err := browserConnection.Websocket.Read(browserConnection.Context)
		if err != nil {
			if errors.Is(err, context.Canceled) {
				browserConnection.Logger.Debugf("Closing Browser ws connection as Context was cancelled!")
			} else if websocket.CloseStatus(err) != -1 {
				if websocket.CloseStatus(err) == websocket.StatusGoingAway {
					browserConnection.Logger.Infof("Browser disconnected voluntarily with status: %v (closed by the browser as the window was closed)", websocket.CloseStatus(err))
				} else {
					browserConnection.Logger.Infof("Browser disconnected voluntarily with status: %v", websocket.CloseStatus(err))
				}
			}

			browserConnection.Logger.Debugf("Browser is disconnected, skipping reading of ws message: %v", err)
			return
		}

		browserConnection.Logger.Tracef("received from browser: %s", string(message))
		browserConnection.Lock()
		browserConnection.LastBrowserMessageTime = time.Now()
		browserConnection.Unlock()

		if messageType != websocket.MessageText {
			browserConnection.Logger.Warnf("received non-text message: %v", messageType)
			continue
		}

		browserMessage := common.DecodeBrowserMessage(message)
		if browserMessage == nil {
			// A message that does not decode as a subscribe is handled as before: only its type is
			// read here, and the writer, which decodes it again, ends the connection to Hasura on it.
			var browserMessageType struct {
				Type string `json:"type"`
			}
			if err = json.Unmarshal(message, &browserMessageType); err != nil {
				browserConnection.Logger.Errorf("failed to unmarshal message: %v", err)
				continue
			}
			browserMessage = &common.BrowserMessage{Raw: message}
			if browserMessageType.Type == "subscribe" && initAuthorized(browserConnection) && routedByText(browserConnection, browserMessage) {
				continue
			}
			browserConnection.FromBrowserToHasuraChannel.SendWait(browserConnection.Context, browserMessage)
			continue
		}

		// Until connection_init is authorized, every message stays on the channel that
		// connectionInitHandler reads, which discards all but connection_init. The other paths have
		// no authentication, limit or consumer before that.
		if browserMessage.Subscribe.Type == "subscribe" && initAuthorized(browserConnection) {
			// The type and the name of the operation are decided here, once, and passed on with the
			// message.
			operation := browserMessage.Decide().Operation

			if !operation.FromDocument {
				if routedByText(browserConnection, browserMessage) {
					continue
				}
			} else if operation.Type == common.Mutation {
				// bbb-graphql-actions does not use the parsed document: it is not kept while the
				// mutation waits in the channel.
				operation.Document, operation.ParseError = nil, nil
				browserConnection.FromBrowserToGqlActionsChannel.SendWait(browserConnection.Context, browserMessage)
				continue
			} else if operation.Type.IsSubscription() && slices.Contains(config.StreamingSubscriptionsManagedByMiddleware, operation.Name) {
				go streamingserver.ReadNewStreamingSubscription(browserConnection, message, operation.Name)
				continue
			}
		}

		// The writer uses the parsed document only to check max_query_depth: without that check it
		// is not kept while the message waits in the channel.
		if browserMessage.Operation != nil && config.GetConfig().Server.MaxQueryDepth <= 0 {
			browserMessage.Operation.Document, browserMessage.Operation.ParseError = nil, nil
		}
		browserConnection.FromBrowserToHasuraChannel.SendWait(browserConnection.Context, browserMessage)
	}
}

// initAuthorized reports whether connectionInitHandler has authorized this connection, which is when
// it sets the meeting.
func initAuthorized(browserConnection *common.BrowserConnection) bool {
	browserConnection.RLock()
	defer browserConnection.RUnlock()

	return browserConnection.MeetingId != ""
}

// routedByText routes a subscribe whose operation was not decided from the document as before, on
// the text of the message: to bbb-graphql-actions when it holds "query":"mutation, and to the
// streaming server when it holds a subscription to one of the streams the middleware answers. It
// reports whether it routed the message; the caller sends any other to Hasura.
func routedByText(browserConnection *common.BrowserConnection, browserMessage *common.BrowserMessage) bool {
	if bytes.Contains(browserMessage.Raw, []byte("\"query\":\"mutation")) {
		if browserMessage.Operation != nil {
			browserMessage.Operation.Document, browserMessage.Operation.ParseError = nil, nil
		}
		browserConnection.FromBrowserToGqlActionsChannel.SendWait(browserConnection.Context, browserMessage)
		return true
	}

	for _, p := range streamingHandleByMiddlewarePatterns {
		if bytes.Contains(browserMessage.Raw, p) {
			go streamingserver.ReadNewStreamingSubscription(browserConnection, browserMessage.Raw, "")
			return true
		}
	}

	return false
}
