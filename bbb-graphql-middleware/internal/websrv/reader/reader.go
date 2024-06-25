package reader

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	log "github.com/sirupsen/logrus"
	"nhooyr.io/websocket"
	"sync"
	"time"
)

func BrowserConnectionReader(
	browserConnectionId string,
	ctx context.Context,
	ctxCancel context.CancelFunc,
	browserWsConn *websocket.Conn,
	fromBrowserToGqlActionsChannel *common.SafeChannelByte,
	fromBrowserToHasuraChannel *common.SafeChannelByte,
	fromBrowserToHasuraConnectionEstablishingChannel *common.SafeChannelByte,
	waitGroups []*sync.WaitGroup) {
	log := log.WithField("_routine", "BrowserConnectionReader").WithField("browserConnectionId", browserConnectionId)
	defer log.Debugf("finished")
	log.Debugf("starting")

	defer func() {
		fromBrowserToHasuraChannel.Close()
		fromBrowserToGqlActionsChannel.Close()
		fromBrowserToHasuraConnectionEstablishingChannel.Close()
	}()

	defer func() {
		// Let other routines know this is about to die
		for _, wg := range waitGroups {
			wg.Done()
		}
		// Wait a little bit before closing the channels
		time.Sleep(100 * time.Millisecond)
	}()

	defer ctxCancel()

	for {
		messageType, message, err := browserWsConn.Read(ctx)
		if err != nil {
			if errors.Is(err, context.Canceled) {
				log.Debugf("Closing Browser ws connection as Context was cancelled!")
			} else {
				log.Debugf("Browser is disconnected, skipping reading of ws message: %v", err)
			}
			return
		}

		log.Tracef("received from browser: %v", message)

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
			return
		}

		if browserMessageType.Type == "subscribe" {
			if bytes.Contains(message, []byte("\"query\":\"mutation")) && !bytes.Contains(message, []byte("update_")) {
				fromBrowserToGqlActionsChannel.Send(message)
				continue
			}
		}

		fromBrowserToHasuraChannel.Send(message)
		fromBrowserToHasuraConnectionEstablishingChannel.Send(message)
	}
}
