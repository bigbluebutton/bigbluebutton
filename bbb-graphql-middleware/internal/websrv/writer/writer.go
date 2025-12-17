package writer

import (
	"bytes"
	"encoding/json"
	"sync"

	"bbb-graphql-middleware/internal/common"

	"github.com/coder/websocket"
)

func BrowserConnectionWriter(
	browserConnection *common.BrowserConnection,
	wg *sync.WaitGroup,
) {
	defer browserConnection.Logger.Debugf("finished")
	browserConnection.Logger.Debugf("starting")
	defer wg.Done()

RangeLoop:
	for {
		select {
		case <-browserConnection.Context.Done():
			browserConnection.Logger.Debug("Browser context cancelled.")
			break RangeLoop
		case toBrowserMessage := <-browserConnection.FromHasuraToBrowserChannel.ReceiveChannel():
			{
				if toBrowserMessage == nil {
					if browserConnection.FromHasuraToBrowserChannel.Closed() {
						break RangeLoop
					}
					continue
				}

				browserConnection.Logger.Tracef("sending to browser: %s", string(toBrowserMessage))
				err := browserConnection.Websocket.Write(browserConnection.Context, websocket.MessageText, toBrowserMessage)
				if err != nil {
					browserConnection.Logger.Debugf("Browser is disconnected, skipping writing of ws message: %v", err)
					return
				}

				// After the error is sent to client, close its connection
				// Authentication hook unauthorized this request
				if bytes.Contains(toBrowserMessage, []byte("connection_error")) {
					type HasuraMessage struct {
						Type string `json:"type"`
					}
					var hasuraMessage HasuraMessage
					_ = json.Unmarshal(toBrowserMessage, &hasuraMessage)
					if hasuraMessage.Type == "connection_error" {
						_ = browserConnection.Websocket.Close(websocket.StatusInternalError, string(toBrowserMessage))
					}
				}
			}
		}
	}
}
