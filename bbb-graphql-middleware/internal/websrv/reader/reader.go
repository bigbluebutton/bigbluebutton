package reader

import (
	"context"
	log "github.com/sirupsen/logrus"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
	"sync"
	"time"
)

func BrowserConnectionReader(browserConnectionId string, ctx context.Context, c *websocket.Conn, fromBrowserChannel1 chan interface{}, fromBrowserChannel2 chan interface{}, waitGroups []*sync.WaitGroup) {
	log := log.WithField("_routine", "BrowserConnectionReader").WithField("browserConnectionId", browserConnectionId)

	defer func() {
		close(fromBrowserChannel1)
		close(fromBrowserChannel2)
	}()

	defer func() {
		// Let other routines know this is about to die
		for _, wg := range waitGroups {
			wg.Done()
		}
		// Wait a little bit before closing the channels
		time.Sleep(100 * time.Millisecond)
	}()

	defer log.Infof("finished")

	for {
		ctx, cancel := context.WithCancel(ctx)
		defer cancel()

		var v interface{}
		err := wsjson.Read(ctx, c, &v)
		if err != nil {
			log.Errorf("error on read (browser is disconnected): %v", err)
			return
		}

		log.Tracef("received from browser: %v", v)

		fromBrowserChannel1 <- v
		fromBrowserChannel2 <- v
	}
}
