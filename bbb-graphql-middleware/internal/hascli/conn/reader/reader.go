package reader

import (
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/iMDT/bbb-graphql-middleware/internal/hascli/replayer"
	log "github.com/sirupsen/logrus"
	"nhooyr.io/websocket/wsjson"
	"sync"
)

// HasuraConnectionReader consumes messages from Hasura connection and add send to the browser channel
func HasuraConnectionReader(hc *common.HasuraConnection, fromHasuraToBrowserChannel chan interface{}, fromBrowserToHasuraChannel chan interface{}, wg *sync.WaitGroup) {
	log := log.WithField("_routine", "HasuraConnectionReader").WithField("browserConnectionId", hc.Browserconn.Id).WithField("hasuraConnectionId", hc.Id)

	defer wg.Done()
	defer hc.ContextCancelFunc()

	defer log.Info("finished")

	for {
		// Read a message from hasura
		var message interface{}
		err := wsjson.Read(hc.Context, hc.Websocket, &message)
		if err != nil {
			log.Errorf("Error: %v", err)
			return
		}

		log.Tracef("received from hasura: %v", message)

		// Write the message to browser
		fromHasuraToBrowserChannel <- message

		var messageAsMap = message.(map[string]interface{})

		// Replay the subscription start commands when hasura confirms the connection
		// this is useful in case of a connection invalidation
		if messageAsMap["type"] == "connection_ack" {
			go replayer.ReplaySubscriptionStartMessages(hc, fromBrowserToHasuraChannel)
		}

	}
}
