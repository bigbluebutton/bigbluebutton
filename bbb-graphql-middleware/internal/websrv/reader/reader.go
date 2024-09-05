package reader

import (
	"bbb-graphql-middleware/internal/common"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	log "github.com/sirupsen/logrus"
	"nhooyr.io/websocket"
	"sync"
	"time"
)

func BrowserConnectionReader(
	browserConnection *common.BrowserConnection,
	waitGroups []*sync.WaitGroup) {
	log := log.WithField("_routine", "BrowserConnectionReader").WithField("browserConnectionId", browserConnection.Id)
	defer log.Debugf("finished")
	log.Debugf("starting")

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
				log.Debugf("Closing Browser ws connection as Context was cancelled!")
			} else {
				log.Debugf("Browser is disconnected, skipping reading of ws message: %v", err)
			}
			return
		}

		log.Tracef("received from browser: %s", string(message))

		if messageType != websocket.MessageText {
			log.Warnf("received non-text message: %v", messageType)
			continue
		}

		var browserMessageType struct {
			Type string `json:"type"`
		}
		err = json.Unmarshal(message, &browserMessageType)
		if err != nil {
			log.Errorf("failed to unmarshal message: %v", err)
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
