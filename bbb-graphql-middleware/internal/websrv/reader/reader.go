package reader

import (
	"bbb-graphql-middleware/internal/common"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"nhooyr.io/websocket"
	"sync"
	"time"
)

func BrowserConnectionReader(
	browserConnection *common.BrowserConnection,
	waitGroups []*sync.WaitGroup) {
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

		var browserMessageType struct {
			Type string `json:"type"`
		}
		err = json.Unmarshal(message, &browserMessageType)
		if err != nil {
			browserConnection.Logger.Errorf("failed to unmarshal message: %v", err)
			continue
		}

		if browserMessageType.Type == "subscribe" {
			if bytes.Contains(message, []byte("\"query\":\"mutation")) {
				browserConnection.FromBrowserToGqlActionsChannel.Send(message)
				continue
			}
		}

		browserConnection.FromBrowserToHasuraChannel.Send(message)
	}
}
