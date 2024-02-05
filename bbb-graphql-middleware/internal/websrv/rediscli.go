package websrv

import (
	"context"
	"encoding/json"
	"github.com/redis/go-redis/v9"
	log "github.com/sirupsen/logrus"
	"os"
	"strings"
	"time"
)

var redisClient = redis.NewClient(&redis.Options{
	Addr:     os.Getenv("BBB_GRAPHQL_MIDDLEWARE_REDIS_ADDRESS"),
	Password: os.Getenv("BBB_GRAPHQL_MIDDLEWARE_REDIS_PASSWORD"),
	DB:       0,
})

func GetRedisConn() *redis.Client {
	return redisClient
}

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
		if !strings.Contains(msg.Payload, "ForceUserGraphqlReconnectionSysMsg") {
			continue
		}

		var message interface{}
		if err := json.Unmarshal([]byte(msg.Payload), &message); err != nil {
			panic(err)
		}

		messageAsMap := message.(map[string]interface{})

		messageEnvelopeAsMap := messageAsMap["envelope"].(map[string]interface{})

		messageType := messageEnvelopeAsMap["name"]

		if messageType == "ForceUserGraphqlReconnectionSysMsg" {
			messageCoreAsMap := messageAsMap["core"].(map[string]interface{})
			messageBodyAsMap := messageCoreAsMap["body"].(map[string]interface{})
			sessionTokenToInvalidate := messageBodyAsMap["sessionToken"]
			log.Debugf("Received invalidate request for sessionToken %v", sessionTokenToInvalidate)

			//Not being used yet
			go InvalidateSessionTokenConnections(sessionTokenToInvalidate.(string))
		}
	}
}

func getCurrTimeInMs() int64 {
	currentTime := time.Now()
	milliseconds := currentTime.UnixNano() / int64(time.Millisecond)
	return milliseconds
}

func sendBbbCoreMsgToRedis(name string, body map[string]interface{}) {
	channelName := "to-akka-apps-redis-channel"

	message := map[string]interface{}{
		"envelope": map[string]interface{}{
			"name": name,
			"routing": map[string]interface{}{
				"sender": "bbb-graphql-middleware",
			},
			"timestamp": getCurrTimeInMs(),
		},
		"core": map[string]interface{}{
			"header": map[string]interface{}{
				"name": name,
			},
			"body": body,
		},
	}

	messageJSON, err := json.Marshal(message)
	if err != nil {
		log.Tracef("Error while marshaling message to json: %v\n", err)
		return
	}

	err = GetRedisConn().Publish(context.Background(), channelName, messageJSON).Err()
	if err != nil {
		log.Tracef("Error while sending msg to redis channel: %v\n", err)
		return
	}

	log.Tracef("JSON message sent to channel %s:\n%s\n", channelName, messageJSON)
}

func SendUserGraphqlReconnectionForcedEvtMsg(sessionToken string) {
	var body = map[string]interface{}{
		"sessionToken": sessionToken,
	}

	sendBbbCoreMsgToRedis("UserGraphqlReconnectionForcedEvtMsg", body)
}

func SendUserGraphqlConnectionEstablishedSysMsg(sessionToken string, browserConnectionId string) {
	var body = map[string]interface{}{
		"sessionToken":        sessionToken,
		"browserConnectionId": browserConnectionId,
	}

	sendBbbCoreMsgToRedis("UserGraphqlConnectionEstablishedSysMsg", body)
}

func SendUserGraphqlConnectionClosedSysMsg(sessionToken string, browserConnectionId string) {
	var body = map[string]interface{}{
		"sessionToken":        sessionToken,
		"browserConnectionId": browserConnectionId,
	}

	sendBbbCoreMsgToRedis("UserGraphqlConnectionClosedSysMsg", body)
}
