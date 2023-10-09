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

func BrowserConnectionReader(browserConnectionId string, ctx context.Context, c *websocket.Conn, fromBrowserChannel1 chan interface{}, fromBrowserChannel2 *common.SafeChannel, waitGroups []*sync.WaitGroup) {
	log := log.WithField("_routine", "BrowserConnectionReader").WithField("browserConnectionId", browserConnectionId)
	defer log.Debugf("finished")
	log.Debugf("starting")

	defer func() {
		close(fromBrowserChannel1)
		fromBrowserChannel2.Close()
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

	fromBrowserChannel2Alive := true

	for {
		var v interface{}
		err := wsjson.Read(ctx, c, &v)
		if err != nil {
			log.Errorf("error on read (browser is disconnected): %v", err)
			return
		}

		log.Tracef("received from browser: %v", v)

		fromBrowserChannel1 <- v
		if fromBrowserChannel2Alive {
			fromBrowserChannel2Alive = fromBrowserChannel2.Send(v)
		}
	}
}
