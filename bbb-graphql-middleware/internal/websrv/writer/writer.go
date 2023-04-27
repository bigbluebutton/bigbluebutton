package writer

import (
	"context"
	log "github.com/sirupsen/logrus"
	"sync"

	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

func BrowserConnectionWriter(browserConnectionId string, ctx context.Context, c *websocket.Conn, toBrowserChannel chan interface{}, wg *sync.WaitGroup) {
	log := log.WithField("_routine", "websocketConnectionWriter").WithField("browserConnectionId", browserConnectionId)

	defer wg.Done()
	defer log.Printf("finished")

RangeLoop:
	for {
		select {
		case <-ctx.Done():
			break RangeLoop
		case toBrowserMessage := <-toBrowserChannel:
			{
				var fromBrowserMessageAsMap = toBrowserMessage.(map[string]interface{})

				log.Tracef("sending to browser: %v", toBrowserMessage)
				err := wsjson.Write(ctx, c, toBrowserMessage)
				if err != nil {
					log.Errorf("error on write (browser is disconnected): %v", err)
					return
				}

				// After the error is sent to client, close its connection
				// Authentication hook unauthorized this request
				if fromBrowserMessageAsMap["type"] == "connection_error" {
					var payloadAsString = fromBrowserMessageAsMap["payload"].(string)
					c.Close(websocket.StatusInternalError, payloadAsString)
				}
			}
		}
	}
}
