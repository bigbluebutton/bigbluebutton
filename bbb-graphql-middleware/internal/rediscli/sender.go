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
	//
	//{
	//	"envelope":{
	//	"name":"CheckAlivePingSysMsg",
	//		"routing":{
	//		"sender":"bbb-web"
	//	},
	//	"timestamp":1695869340801
	//},
	//	"core":{
	//	"header":{
	//		"name":"CheckAlivePingSysMsg"
	//	},
	//	"body":{
	//		"system":"BbbWeb",
	//			"bbbWebTimestamp":1695869340801,
	//			"akkaAppsTimestamp":1695869330804
	//	}
	//}
	//}
	//
	//
	//{"envelope":{"name":"ChangeUserReactionEmojiReqMsg",
	//				"routing":{"meetingId":"790fd2a37c12e52b0675f2d0bfcf01d182cbd56b-1695868246887","userId":"w_xsupr9oolum7"},
	//	"timestamp":1695868659274},
	//	"core":{"header":{"name":"ChangeUserReactionEmojiReqMsg","meetingId":"790fd2a37c12e52b0675f2d0bfcf01d182cbd56b-1695868246887","userId":"w_xsupr9oolum7"},
	//	"body":{"reactionEmoji":"🙁","userId":"w_xsupr9oolum7"}}}
	//
	//{"core":{"body":{"browserConnectionId":"BC0000000154","sessionToken":"omcvytyowvt2jeny"},
	//	"header":{"meetingId":"notUsed","name":"UserGraphqlConnectionStablishedSysMsg","userId":"notUsed"}},
	//	"envelope":{"name":"UserGraphqlConnectionStablishedSysMsg","routing":{"sender":"bbb-graphql-middleware"},
	//		"timestamp":1695868658314}}
	//
	//{"core":{"body":{"browserConnectionId":"BC0000000153","sessionToken":"omcvytyowvt2jeny"},
	//	"header":{"meetingId":"notUsed","name":"UserGraphqlConnectionStablishedSysMsg","userId":"notUsed"}},
	//	"envelope":{"name":"UserGraphqlConnectionStablishedSysMsg","routing":{"sender":"bbb-graphql-middleware"},"timestamp":1695868647306}}

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
