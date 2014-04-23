
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

	private IBigBlueButtonInGW bbbGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.ANTON_CHANNEL))
		{
			System.out.println("AntonChannel=(chatlistener)" + channel);

			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			JsonObject headerObject = (JsonObject) obj.get("header");
			JsonObject payloadObject = (JsonObject) obj.get("payload");
			JsonObject messageObject = (JsonObject)payloadObject.get("message");

			String eventName = (String) headerObject.get("name").toString();
			eventName = eventName.replace("\"", "");

			if(eventName.equalsIgnoreCase("public_chat_message_event") || 
				eventName.equalsIgnoreCase("send_public_chat_message") ||
				eventName.equalsIgnoreCase("private_chat_message_event") ||
				eventName.equalsIgnoreCase("send_private_chat_message")){


				String meeting_id = (String) payloadObject.get("meeting_id").toString();
				meeting_id = meeting_id.replace("\"", "");

				String requester_id = (String) payloadObject.get("requester_id").toString();
				requester_id = requester_id.replace("\"", "");

				String chatType = (String) messageObject.get("chatType").toString();
				chatType = chatType.replace("\"", "");

				String fromUserID = (String) messageObject.get("fromUserID").toString();
				fromUserID = fromUserID.replace("\"", "");

				String fromUsername = (String) messageObject.get("fromUsername").toString();
				fromUsername = fromUsername.replace("\"", "");

				String fromColor = (String) messageObject.get("fromColor").toString();
				fromColor = fromColor.replace("\"", "");

				String fromTime = (String) messageObject.get("fromTime").toString();
				fromTime = fromTime.replace("\"", "");

				String fromTimezoneOffset = (String) messageObject.get("fromTimezoneOffset").toString();
				fromTimezoneOffset = fromTimezoneOffset.replace("\"", "");
				String fromLang = (String) messageObject.get("fromLang").toString();
				fromLang = fromLang.replace("\"", ""); 
				String toUserID = (String) messageObject.get("toUserID").toString();
				toUserID = toUserID.replace("\"", "");

				String toUsername = (String) messageObject.get("toUsername").toString();
				toUsername = toUsername.replace("\"", "");

				String chatText = (String) messageObject.get("message").toString();
				chatText = chatText.replace("\"", "");


				Map<String, String> map = new HashMap<String, String>();
				map.put(ChatKeyUtil.CHAT_TYPE, chatType); 
				map.put(ChatKeyUtil.FROM_USERID, fromUserID);
				map.put(ChatKeyUtil.FROM_USERNAME, fromUsername);
				map.put(ChatKeyUtil.FROM_COLOR, fromColor);
				map.put(ChatKeyUtil.FROM_TIME, fromTime);   
				map.put(ChatKeyUtil.FROM_TZ_OFFSET, fromTimezoneOffset);
				map.put(ChatKeyUtil.FROM_LANG, fromLang);
				map.put(ChatKeyUtil.TO_USERID, toUserID);
				map.put(ChatKeyUtil.TO_USERNAME, toUsername);
				map.put(ChatKeyUtil.MESSAGE, chatText);

				//public message
				if(eventName.equalsIgnoreCase("public_chat_message_event") || eventName.equalsIgnoreCase("send_public_chat_message")) //put this string into a constants file
				{
					System.out.println("I'm in the case for a public chat message" );

					bbbGW.sendPublicMessage(meeting_id, requester_id, map);

				}
				//private message
				else if(eventName.equalsIgnoreCase("private_chat_message_event") || eventName.equalsIgnoreCase("send_private_chat_message")) //put this string into a constants file
				{
					System.out.println("I'm in the case for a private chat message" );

					bbbGW.sendPrivateMessage(meeting_id, requester_id, map); //TODO not tested yet
				}
				//case getChatHistory TODO
				/*else if (0) 
				{
					System.out.println("I'm in the case for a requesting chat history" );

					bbbGW.sendPublicChatHistory(meeting_id, requester_id);
				}*/
			}
		}
	}
}
