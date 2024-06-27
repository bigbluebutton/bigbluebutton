package writer

import (
	"context"
	"encoding/json"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	log "github.com/sirupsen/logrus"
	"nhooyr.io/websocket"
	"strings"
	"sync"
)

func BrowserConnectionWriter(
	browserConnectionId string,
	ctx context.Context,
	browserWsConn *websocket.Conn,
	fromHasuraToBrowserChannel *common.SafeChannelByte,
	wg *sync.WaitGroup) {
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

				log.Tracef("sending to browser: %v", toBrowserMessage)
				err := browserWsConn.Write(ctx, websocket.MessageText, toBrowserMessage)
				if err != nil {
					log.Debugf("Browser is disconnected, skipping writing of ws message: %v", err)
					return
				}

				// After the error is sent to client, close its connection
				// Authentication hook unauthorized this request
				if strings.Contains(string(toBrowserMessage), "connection_error") {
					type HasuraMessage struct {
						Type string `json:"type"`
					}
					var hasuraMessage HasuraMessage
					_ = json.Unmarshal(toBrowserMessage, &hasuraMessage)
					if hasuraMessage.Type == "connection_error" {
						_ = browserWsConn.Close(websocket.StatusInternalError, string(toBrowserMessage))
					}
				}
			}
		}
	}
}
