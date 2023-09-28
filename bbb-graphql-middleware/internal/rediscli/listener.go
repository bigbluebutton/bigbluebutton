package rediscli

import (
	"context"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"strings"
)

func StartRedisListener() {
	log := log.WithField("_routine", "StartRedisListener")

	var ctx = context.Background()

	subscriber := GetRedisConn().Subscribe(ctx, "from-akka-apps-redis-channel")

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
			log.Debugf("Received invalidate request for sessionToken %v", sessionTokenToInvalidate)

			//Not being used yet
			//websrv.InvalidateSessionTokenConnections(sessionTokenToInvalidate.(string))
		}
	}
}
