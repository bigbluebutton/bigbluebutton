
package org.bigbluebutton.conference.service.chat;


import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;
import org.bigbluebutton.conference.service.presentation.ConversionUpdatesProcessor;
import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

import java.util.Map;
import java.util.HashMap;

import org.bigbluebutton.core.api.IBigBlueButtonInGW;

public class ChatMessageListener implements MessageHandler{
	
	/*private ConversionUpdatesProcessor conversionUpdatesProcessor;
	
	public void setConversionUpdatesProcessor(ConversionUpdatesProcessor p) {
		conversionUpdatesProcessor = p;
	}*/	

	private IBigBlueButtonInGW bbbGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.ANTON_CHANNEL))
		{
			// TODO: Parse JSON message
			// call the bbbInGW (getChatHistory, sendPublicMessage, sendPrivateMessage)


			
			System.out.println("AntonChannel=(chatlistener)" + channel);

			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			JsonObject headerObject = (JsonObject) obj.get("header");

			JsonObject payloadObject = (JsonObject) obj.get("payload");
			JsonObject messageObject = (JsonObject)payloadObject.get("message");
			//String chatType = (String)messageObject.get("chatType").toString();//TODO: put in try-cach block perhaps
			/*
			{
				"payload": {
					"message": {
						"toUsername": "public_chat_username",
						"toUserID": "public_chat_userid",
						"fromUserID": "warlvv6c4gx2",
						"fromColor": "0",
						"fromTimezoneOffset": "240",
						"fromTime": "1.398196307904E12",
						"chatType": "PUBLIC_CHAT",
						"message": "heeeeeeey",
						"fromLang": "en",
						"fromUsername": "Anton Georgiev"
					},
					"recorded": false,
					"meeting_id": "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1398196289839",
					"requester_id": "warlvv6c4gx2"
				},
				"header": {
					"timestamp": 268831205503223,
					"name": "send_public_chat_message"
				}
			}
			*/
			Map<String,String> messageMap = new HashMap<String, String>();

			String toUsername = (String) messageObject.get("toUsername").toString();
			toUsername = toUsername.replace("\"", "");
			messageMap.put("toUsername", toUsername);

			String toUserID = (String) messageObject.get("toUserID").toString();
			toUserID = toUserID.replace("\"", "");
			messageMap.put("toUserID", toUserID);

			String fromUserID = (String) messageObject.get("fromUserID").toString();
			fromUserID = fromUserID.replace("\"", "");
			messageMap.put("fromUserID", fromUserID);

			String fromColor = (String) messageObject.get("fromColor").toString();
			fromColor = fromColor.replace("\"", "");
			messageMap.put("fromColor", fromColor);

			String fromTimezoneOffset = (String) messageObject.get("fromTimezoneOffset").toString();
			fromTimezoneOffset = fromTimezoneOffset.replace("\"", "");
			messageMap.put("fromTimezoneOffset", fromTimezoneOffset);

			String fromTime = (String) messageObject.get("fromTime").toString();
			fromTime = fromTime.replace("\"", "");
			messageMap.put("fromTime", fromTime);

			String chatType = (String) messageObject.get("chatType").toString();
			chatType = chatType.replace("\"", "");
			messageMap.put("chatType", chatType);

			String messageText = (String) messageObject.get("message").toString();
			messageText = messageText.replace("\"", "");
			messageMap.put("message", messageText);

			String fromLang = (String) messageObject.get("fromLang").toString();
			fromLang = fromLang.replace("\"", "");
			messageMap.put("fromLang", fromLang);

			String fromUsername = (String) messageObject.get("fromUsername").toString();
			fromUsername = fromUsername.replace("\"", "");
			messageMap.put("fromUsername", fromUsername);

			Map<String,Object> payload = new HashMap<String, Object>();
			payload.put("message", messageMap);

			String recorded = (String) payloadObject.get("recorded").toString();
			recorded = recorded.replace("\"", "");
			payload.put("recorded", recorded);

			String meeting_id = (String) payloadObject.get("meeting_id").toString();
			meeting_id = meeting_id.replace("\"", "");
			payload.put("meeting_id", meeting_id);

			String requester_id = (String) payloadObject.get("requester_id").toString();
			requester_id = requester_id.replace("\"", "");
			payload.put("requester_id", requester_id);


			Map<String,Object> header = new HashMap<String, Object>();

			String timestamp = (String) headerObject.get("timestamp").toString();
			timestamp = timestamp.replace("\"", "");
			header.put("timestamp", timestamp);

			String eventName = (String) headerObject.get("name").toString();
			eventName = eventName.replace("\"", "");
			header.put("name", eventName);


			Map<String,Object> map = new HashMap<String, Object>();
			map.put("header", header);
			map.put("payload", payload);


			if(eventName.equalsIgnoreCase("public_chat_message_event") || eventName.equalsIgnoreCase("send_public_chat_message")) //put this string into a constants file
			{
				System.out.println("I'm in the case for a public chat message" );

				// the problem here is that this map is <String, Object> and must be <String, String>
				//bbbGW.sendPublicMessage(meeting_id, requester_id, map);

			}
			else if(eventName.equalsIgnoreCase("private_chat_message_event") || eventName.equalsIgnoreCase("send_private_chat_message")) //put this string into a constants file
			{
				System.out.println("I'm in the case for a private chat message" );

				// the problem here is that this map is <String, Object> and must be <String, String>
				//bbbGW.sendPrivateMessage(meeting_id, requester_id, map);
			}
			/*else if (0) //case getChatHistory
			{

			}*/
		}
	}
}
