package writer

import (
	"context"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	log "github.com/sirupsen/logrus"
	"sync"

	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

func BrowserConnectionWriter(browserConnectionId string, ctx context.Context, c *websocket.Conn, fromHasuraToBrowserChannel *common.SafeChannel, wg *sync.WaitGroup) {
	log := log.WithField("_routine", "BrowserConnectionWriter").WithField("browserConnectionId", browserConnectionId)
	defer log.Debugf("finished")
	log.Debugf("starting")
	defer wg.Done()

RangeLoop:
	for {
		select {
		case <-ctx.Done():
			break RangeLoop
		case toBrowserMessage := <-fromHasuraToBrowserChannel.ReceiveChannel():
			{
				var toBrowserMessageAsMap = toBrowserMessage.(map[string]interface{})

				log.Tracef("sending to browser: %v", toBrowserMessage)
				err := wsjson.Write(ctx, c, toBrowserMessage)
				if err != nil {
					log.Debugf("Browser is disconnected, skiping writing of ws message: %v", err)
					return
				}

				// After the error is sent to client, close its connection
				// Authentication hook unauthorized this request
				if toBrowserMessageAsMap["type"] == "connection_error" {
					var payloadAsString = toBrowserMessageAsMap["payload"].(string)
					c.Close(websocket.StatusInternalError, payloadAsString)
				}
			}
		}
	}
}
