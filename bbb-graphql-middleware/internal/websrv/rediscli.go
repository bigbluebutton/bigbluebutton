package websrv

import (
	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
	log "github.com/sirupsen/logrus"
)

var redisClient = redis.NewClient(&redis.Options{
	Addr:     fmt.Sprintf("%s:%d", config.GetConfig().Redis.Host, config.GetConfig().Redis.Port),
	Password: config.GetConfig().Redis.Password,
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
			log.Errorf("error: %v", err)
		}

		// Skip parsing unnecessary messages
		if !strings.Contains(msg.Payload, "ForceUserGraphqlReconnectionSysMsg") &&
			!strings.Contains(msg.Payload, "ForceUserGraphqlDisconnectionSysMsg") &&
			!strings.Contains(msg.Payload, "CheckGraphqlMiddlewareAlivePingSysMsg") {
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
			reason := messageBodyAsMap["reason"]
			log.Infof("Received reconnection request for sessionToken %v (%v)", sessionTokenToInvalidate, reason)

			go InvalidateSessionTokenHasuraConnections(sessionTokenToInvalidate.(string))
		}

		if messageType == "ForceUserGraphqlDisconnectionSysMsg" {
			messageCoreAsMap := messageAsMap["core"].(map[string]interface{})
			messageBodyAsMap := messageCoreAsMap["body"].(map[string]interface{})
			sessionTokenToInvalidate := messageBodyAsMap["sessionToken"]
			reason := messageBodyAsMap["reason"]
			reasonMsgId := messageBodyAsMap["reasonMessageId"]
			log.Infof("Received disconnection request for sessionToken %v (%s - %s)", sessionTokenToInvalidate, reasonMsgId, reason)

			//Not being used yet
			go InvalidateSessionTokenBrowserConnections(sessionTokenToInvalidate.(string), reasonMsgId.(string), reason.(string))
		}

		//Ping message requires a response with a Pong message
		if messageType == "CheckGraphqlMiddlewareAlivePingSysMsg" &&
			strings.Contains(msg.Payload, common.GetUniqueID()) {
			messageCoreAsMap := messageAsMap["core"].(map[string]interface{})
			messageBodyAsMap := messageCoreAsMap["body"].(map[string]interface{})
			middlewareUID := messageBodyAsMap["middlewareUID"]
			if middlewareUID == common.GetUniqueID() {
				log.Infof("Received ping message from akka-apps")
				go SendCheckGraphqlMiddlewareAlivePongSysMsg()
			}
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

	if log.IsLevelEnabled(log.DebugLevel) {
		if bodyAsJson, err := json.Marshal(body); err == nil {
			log.Debugf("Redis message sent %s: %s", name, bodyAsJson)
		}
	}
	log.Tracef("JSON message sent to channel %s:\n%s\n", channelName, string(messageJSON))
}

func SendUserGraphqlReconnectionForcedEvtMsg(sessionToken string) {
	var body = map[string]interface{}{
		"middlewareUID": common.GetUniqueID(),
		"sessionToken":  sessionToken,
	}

	sendBbbCoreMsgToRedis("UserGraphqlReconnectionForcedEvtMsg", body)
}

func SendUserGraphqlDisconnectionForcedEvtMsg(sessionToken string) {
	var body = map[string]interface{}{
		"middlewareUID": common.GetUniqueID(),
		"sessionToken":  sessionToken,
	}

	sendBbbCoreMsgToRedis("UserGraphqlDisconnectionForcedEvtMsg", body)
}

func SendUserGraphqlConnectionEstablishedSysMsg(
	sessionToken string,
	clientSessionUUID string,
	clientType string,
	clientIsMobile bool,
	browserConnectionId string) {
	var body = map[string]interface{}{
		"middlewareUID":       common.GetUniqueID(),
		"sessionToken":        sessionToken,
		"clientSessionUUID":   clientSessionUUID,
		"clientType":          clientType,
		"clientIsMobile":      clientIsMobile,
		"browserConnectionId": browserConnectionId,
	}

	sendBbbCoreMsgToRedis("UserGraphqlConnectionEstablishedSysMsg", body)
}

func SendUserGraphqlConnectionClosedSysMsg(sessionToken string, browserConnectionId string) {
	var body = map[string]interface{}{
		"middlewareUID":       common.GetUniqueID(),
		"sessionToken":        sessionToken,
		"browserConnectionId": browserConnectionId,
	}

	sendBbbCoreMsgToRedis("UserGraphqlConnectionClosedSysMsg", body)
}

func SendCheckGraphqlMiddlewareAlivePongSysMsg() {
	var body = map[string]interface{}{
		"middlewareUID": common.GetUniqueID(),
	}

	sendBbbCoreMsgToRedis("CheckGraphqlMiddlewareAlivePongSysMsg", body)
}
