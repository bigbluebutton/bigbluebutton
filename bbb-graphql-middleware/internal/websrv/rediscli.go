package websrv

import (
	"context"
	"encoding/json"
	"fmt"
	"slices"
	"strings"
	"time"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
	streamingserver "bbb-graphql-middleware/internal/streaming_server"

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

var allowedMessages = []string{
	"ForceUserGraphqlReconnectionSysMsg",
	"ForceUserGraphqlDisconnectionSysMsg",
	"CheckGraphqlMiddlewareAlivePingSysMsg",
	"SendCursorPositionEvtMsg",
	"SetCurrentPageEvtMsg",
	"ModifyWhiteboardAccessEvtMsg",
	"UserLeftMeetingEvtMsg",
	"MeetingEndedEvtMsg",
}

func StartRedisListener() {
	log := log.WithField("_routine", "StartRedisListener")

	ctx := context.Background()

	subscriber := GetRedisConn().Subscribe(ctx, "from-akka-apps-redis-channel")

	for {
		msg, err := subscriber.ReceiveMessage(ctx)
		if err != nil {
			log.Errorf("error: %v", err)
		}

		var receivedRedisMessageEnvelope struct {
			Envelope struct {
				Name string `json:"name"`
			} `json:"envelope"`
		}

		err = json.Unmarshal([]byte(msg.Payload), &receivedRedisMessageEnvelope)
		if err != nil {
			continue
		}

		// Skip parsing unnecessary messages
		if !slices.Contains(allowedMessages, receivedRedisMessageEnvelope.Envelope.Name) {
			continue
		}

		log.Debugf("Received Redis Message: %s\n", receivedRedisMessageEnvelope.Envelope.Name)

		var receivedMessage common.RedisMessage

		if err := json.Unmarshal([]byte(msg.Payload), &receivedMessage); err != nil {
			continue
		}

		messageName := receivedRedisMessageEnvelope.Envelope.Name

		if messageName == "ForceUserGraphqlReconnectionSysMsg" {
			sessionTokenToInvalidate := receivedMessage.Core.Body["sessionToken"]
			reason := receivedMessage.Core.Body["reason"]
			log.Infof("Received reconnection request for sessionToken %v (%v)", sessionTokenToInvalidate, reason)

			go InvalidateSessionTokenHasuraConnections(sessionTokenToInvalidate.(string))
		}

		if messageName == "ForceUserGraphqlDisconnectionSysMsg" {
			sessionTokenToInvalidate := receivedMessage.Core.Body["sessionToken"]
			reason := receivedMessage.Core.Body["reason"]
			reasonMsgId := receivedMessage.Core.Body["reasonMessageId"]
			log.Infof("Received disconnection request for sessionToken %v (%s - %s)", sessionTokenToInvalidate, reasonMsgId, reason)

			// Not being used yet
			go InvalidateSessionTokenBrowserConnections(sessionTokenToInvalidate.(string), reasonMsgId.(string), reason.(string))
		}

		// Clear cursor position history on SetCurrentPage or ModifyWhiteboardAccess
		if messageName == "SetCurrentPageEvtMsg" || messageName == "ModifyWhiteboardAccessEvtMsg" {
			log.Debugf("Removing cursor positions for meeting: %s", receivedMessage.Core.Header.MeetingId)
			go streamingserver.RemoveMeetingCursorsCache(receivedMessage.Core.Header.MeetingId)
		}
		if messageName == "MeetingEndedEvtMsg" {
			log.Debugf("Removing cursor positions for meeting: %s", receivedMessage.Core.Body["meetingId"].(string))
			go streamingserver.RemoveMeetingCursorsCache(receivedMessage.Core.Body["meetingId"].(string))
		}
		if messageName == "UserLeftMeetingEvtMsg" {
			log.Debugf("Removing cursor positions for meeting: %s, user: %s", receivedMessage.Core.Header.MeetingId, receivedMessage.Core.Header.UserId)
			go streamingserver.RemoveUserCursorsCache(receivedMessage.Core.Header.MeetingId, receivedMessage.Core.Header.UserId)
		}

		if messageName == "SendCursorPositionEvtMsg" {
			go streamingserver.HandleSendCursorPositionEvtMsg(
				receivedMessage,
				BrowserConnectionsMutex,
				BrowserConnections,
			)
		}

		// Ping message requires a response with a Pong message
		if messageName == "CheckGraphqlMiddlewareAlivePingSysMsg" &&
			strings.Contains(msg.Payload, common.GetUniqueID()) {
			middlewareUID := receivedMessage.Core.Body["middlewareUID"]
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
	body := map[string]interface{}{
		"middlewareUID": common.GetUniqueID(),
		"sessionToken":  sessionToken,
	}

	sendBbbCoreMsgToRedis("UserGraphqlReconnectionForcedEvtMsg", body)
}

func SendUserGraphqlDisconnectionForcedEvtMsg(sessionToken string) {
	body := map[string]interface{}{
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
	browserConnectionId string,
) {
	body := map[string]interface{}{
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
	body := map[string]interface{}{
		"middlewareUID":       common.GetUniqueID(),
		"sessionToken":        sessionToken,
		"browserConnectionId": browserConnectionId,
	}

	sendBbbCoreMsgToRedis("UserGraphqlConnectionClosedSysMsg", body)
}

func SendCheckGraphqlMiddlewareAlivePongSysMsg() {
	body := map[string]interface{}{
		"middlewareUID": common.GetUniqueID(),
	}

	sendBbbCoreMsgToRedis("CheckGraphqlMiddlewareAlivePongSysMsg", body)
}
