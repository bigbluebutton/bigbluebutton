package invalidator

import (
	"context"
	"encoding/json"
	"github.com/iMDT/bbb-graphql-middleware/internal/websrv"
	"github.com/redis/go-redis/v9"
	log "github.com/sirupsen/logrus"
	"strings"
)

func BrowserConnectionInvalidator() {
	log := log.WithField("_routine", "BrowserConnectionInvalidator")

	var ctx = context.Background()

	redisClient := redis.NewClient(&redis.Options{
		Addr:     "127.0.0.1:6379",
		Password: "",
		DB:       0,
	})

	subscriber := redisClient.Subscribe(ctx, "from-akka-apps-redis-channel")

	for {
		msg, err := subscriber.ReceiveMessage(ctx)
		if err != nil {
			log.Errorf("error: ", err)
		}

		// Skip parsing unnecessary messages
		if !strings.Contains(msg.Payload, "InvalidateUserGraphqlConnectionSysMsg") {
			continue
		}

		var message interface{}
		if err := json.Unmarshal([]byte(msg.Payload), &message); err != nil {
			panic(err)
		}

		messageAsMap := message.(map[string]interface{})

		messageEnvelopeAsMap := messageAsMap["envelope"].(map[string]interface{})

		messageType := messageEnvelopeAsMap["name"]

		if messageType == "InvalidateUserGraphqlConnectionSysMsg" {
			messageCoreAsMap := messageAsMap["core"].(map[string]interface{})
			messageBodyAsMap := messageCoreAsMap["body"].(map[string]interface{})
			sessionTokenToInvalidate := messageBodyAsMap["sessionToken"]
			log.Infof("Received invalidate request for sessionToken %v", sessionTokenToInvalidate)

			websrv.BrowserConnectionsMutex.Lock()
			for _, browserConnection := range websrv.BrowserConnections {
				if browserConnection.SessionToken == sessionTokenToInvalidate {
					if browserConnection.HasuraConnection != nil {
						log.Infof("Processing invalidate request for sessionToken %v (hasura connection %v)", sessionTokenToInvalidate, browserConnection.HasuraConnection.Id)
						browserConnection.HasuraConnection.ContextCancelFunc()
						log.Infof("Processed invalidate request for sessionToken %v (hasura connection %v)", sessionTokenToInvalidate, browserConnection.HasuraConnection.Id)
					}
				}
			}
			websrv.BrowserConnectionsMutex.Unlock()
		}
	}
}
