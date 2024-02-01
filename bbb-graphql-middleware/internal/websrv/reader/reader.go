package reader

import (
	"context"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	log "github.com/sirupsen/logrus"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
	"sync"
	"time"
)

func BrowserConnectionReader(browserConnectionId string, ctx context.Context, c *websocket.Conn, fromBrowserToHasuraChannel *common.SafeChannel, fromBrowserToHasuraConnectionEstablishingChannel *common.SafeChannel, waitGroups []*sync.WaitGroup) {
	log := log.WithField("_routine", "BrowserConnectionReader").WithField("browserConnectionId", browserConnectionId)
	defer log.Debugf("finished")
	log.Debugf("starting")

	defer func() {
		fromBrowserToHasuraChannel.Close()
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

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	for {
		var v interface{}
		err := wsjson.Read(ctx, c, &v)
		if err != nil {
			log.Debugf("Browser is disconnected, skiping reading of ws message: %v", err)
			return
		}

		log.Tracef("received from browser: %v", v)

		fromBrowserToHasuraChannel.Send(v)
		fromBrowserToHasuraConnectionEstablishingChannel.Send(v)
	}
}
