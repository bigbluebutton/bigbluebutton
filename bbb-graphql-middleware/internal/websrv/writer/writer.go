package writer

import (
	"context"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	log "github.com/sirupsen/logrus"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
	"sync"
)

func BrowserConnectionWriter(browserConnectionId string, ctx context.Context, browserWsConn *websocket.Conn, fromHasuraToBrowserChannel *common.SafeChannel, wg *sync.WaitGroup) {
	log := log.WithField("_routine", "BrowserConnectionWriter").WithField("browserConnectionId", browserConnectionId)
	defer log.Debugf("finished")
	log.Debugf("starting")
	defer wg.Done()

RangeLoop:
	for {
		select {
		case <-ctx.Done():
			log.Debug("Browser context cancelled.")
			break RangeLoop
		case toBrowserMessage := <-fromHasuraToBrowserChannel.ReceiveChannel():
			{
				if toBrowserMessage == nil {
					if fromHasuraToBrowserChannel.Closed() {
						break RangeLoop
					}
					continue
				}

				var toBrowserMessageAsMap = toBrowserMessage.(map[string]interface{})

				log.Tracef("sending to browser: %v", toBrowserMessage)
				err := wsjson.Write(ctx, browserWsConn, toBrowserMessage)
				if err != nil {
					log.Debugf("Browser is disconnected, skipping writing of ws message: %v", err)
					return
				}

				// After the error is sent to client, close its connection
				// Authentication hook unauthorized this request
				if toBrowserMessageAsMap["type"] == "connection_error" {
					var payloadAsString = toBrowserMessageAsMap["payload"].(string)
					browserWsConn.Close(websocket.StatusInternalError, payloadAsString)
				}
			}
		}
	}
}
