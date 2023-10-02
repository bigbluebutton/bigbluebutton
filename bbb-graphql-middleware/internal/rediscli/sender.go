package rediscli

import (
	"context"
	"encoding/json"
	"fmt"
	"time"
)

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
		fmt.Printf("Error while marshaling message to json: %v\n", err)
		return
	}

	err = GetRedisConn().Publish(context.Background(), channelName, messageJSON).Err()
	if err != nil {
		fmt.Printf("Error while sending msg to redis channel: %v\n", err)
		return
	}

	fmt.Printf("JSON message sent to channel %s:\n%s\n", channelName, messageJSON)
}

func SendUserGraphqlConnectionInvalidatedEvtMsg(sessionToken string) {
	var body = map[string]interface{}{
		"sessionToken": sessionToken,
	}

	sendBbbCoreMsgToRedis("UserGraphqlConnectionInvalidatedEvtMsg", body)
}

func SendUserGraphqlConnectionStablishedSysMsg(sessionToken string, browserConnectionId string) {
	var body = map[string]interface{}{
		"sessionToken":        sessionToken,
		"browserConnectionId": browserConnectionId,
	}

	sendBbbCoreMsgToRedis("UserGraphqlConnectionStablishedSysMsg", body)
}

func SendUserGraphqlConnectionClosedSysMsg(sessionToken string, browserConnectionId string) {
	var body = map[string]interface{}{
		"sessionToken":        sessionToken,
		"browserConnectionId": browserConnectionId,
	}

	sendBbbCoreMsgToRedis("UserGraphqlConnectionClosedSysMsg", body)
}
