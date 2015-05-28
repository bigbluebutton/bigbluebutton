package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.common.messages.GetChatHistoryReplyMessage;
import org.bigbluebutton.common.messages.SendPrivateChatMessage;
import org.bigbluebutton.common.messages.SendPublicChatMessage;
import org.bigbluebutton.red5.client.messaging.BroadcastClientMessage;
import org.bigbluebutton.red5.client.messaging.ConnectionInvokerService;
import org.bigbluebutton.red5.service.ChatKeyUtil;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class ChatClientMessageSender {
	private ConnectionInvokerService service;
	
	public ChatClientMessageSender(ConnectionInvokerService service) {
		this.service = service;
	}

	public void handleChatMessage(String message) {

		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				switch (messageName) {
					case SendPublicChatMessage.SEND_PUBLIC_CHAT_MESSAGE:
						SendPublicChatMessage spucm = SendPublicChatMessage.fromJson(message);

						if (spucm != null) {
							processSendPublicChatMessage(spucm);
						}
						break;
					case SendPrivateChatMessage.SEND_PRIVATE_CHAT_MESSAGE:
						SendPrivateChatMessage sprcm = SendPrivateChatMessage.fromJson(message);

						if (sprcm != null) {
							processSendPrivateChatMessage(sprcm);
						}
						break;
					case GetChatHistoryReplyMessage.GET_CHAT_HISTORY_REPLY:
						GetChatHistoryReplyMessage gch = GetChatHistoryReplyMessage.fromJson(message);

						if (gch != null) {
							processGetChatHistoryReply(gch);
						}
						break;
				}
			}
		}
	}


	private void processSendPublicChatMessage(SendPublicChatMessage msg) {
		Map<String, Object> messageInfo = new HashMap<String, Object>();
		messageInfo.put(ChatKeyUtil.CHAT_TYPE, msg.messageInfo.get(ChatKeyUtil.CHAT_TYPE));
		messageInfo.put(ChatKeyUtil.FROM_USERID, msg.messageInfo.get(ChatKeyUtil.FROM_USERID));
		messageInfo.put(ChatKeyUtil.FROM_USERNAME, msg.messageInfo.get(ChatKeyUtil.FROM_USERNAME));
		messageInfo.put(ChatKeyUtil.TO_USERID, msg.messageInfo.get(ChatKeyUtil.TO_USERID));
		messageInfo.put(ChatKeyUtil.TO_USERNAME, msg.messageInfo.get(ChatKeyUtil.TO_USERNAME));
		messageInfo.put(ChatKeyUtil.FROM_TIME, msg.messageInfo.get(ChatKeyUtil.FROM_TIME));
		messageInfo.put(ChatKeyUtil.FROM_TZ_OFFSET, msg.messageInfo.get(ChatKeyUtil.FROM_TZ_OFFSET));
		messageInfo.put(ChatKeyUtil.FROM_COLOR, msg.messageInfo.get(ChatKeyUtil.FROM_COLOR));
		messageInfo.put(ChatKeyUtil.MESSAGE, msg.messageInfo.get(ChatKeyUtil.MESSAGE));

		System.out.println("RedisPubSubMessageHandler - processSendPublicChatMessage \n" +messageInfo.toString()+ "\n");

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "ChatReceivePublicMessageCommand", messageInfo);
		service.sendMessage(m);
	}

	private void processSendPrivateChatMessage(SendPrivateChatMessage msg) {
		Map<String, Object> messageInfo = new HashMap<String, Object>();
		messageInfo.put(ChatKeyUtil.CHAT_TYPE, msg.messageInfo.get(ChatKeyUtil.CHAT_TYPE));
		messageInfo.put(ChatKeyUtil.FROM_USERID, msg.messageInfo.get(ChatKeyUtil.FROM_USERID));
		messageInfo.put(ChatKeyUtil.FROM_USERNAME, msg.messageInfo.get(ChatKeyUtil.FROM_USERNAME));
		messageInfo.put(ChatKeyUtil.TO_USERID, msg.messageInfo.get(ChatKeyUtil.TO_USERID));
		messageInfo.put(ChatKeyUtil.TO_USERNAME, msg.messageInfo.get(ChatKeyUtil.TO_USERNAME));
		messageInfo.put(ChatKeyUtil.FROM_TIME, msg.messageInfo.get(ChatKeyUtil.FROM_TIME));
		messageInfo.put(ChatKeyUtil.FROM_TZ_OFFSET, msg.messageInfo.get(ChatKeyUtil.FROM_TZ_OFFSET));
		messageInfo.put(ChatKeyUtil.FROM_COLOR, msg.messageInfo.get(ChatKeyUtil.FROM_COLOR));
		messageInfo.put(ChatKeyUtil.MESSAGE, msg.messageInfo.get(ChatKeyUtil.MESSAGE));

		System.out.println("RedisPubSubMessageHandler - processSendPrivateChatMessage \n" +messageInfo.toString()+ "\n");

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "ChatReceivePrivateMessageCommand", messageInfo);
		service.sendMessage(m);
	}

	private void processGetChatHistoryReply(GetChatHistoryReplyMessage gch) {

		System.out.println("RedisPubSubMessageHandler - processGetChatHistory \n" +gch.toString()+ "\n");

		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("meetingId", gch.meetingId);
		args.put("requseter_id", gch.requesterId);
		args.put("chat_history", gch.chatHistory);

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args.get("chat_history")));

		System.out.println("*************************************************************************************\n");
		System.out.println("RedisPubSubMessageHandler - processGetChatHistoryReply \n" + message.get("msg") + "\n");
		System.out.println("*************************************************************************************\n");

		BroadcastClientMessage m = new BroadcastClientMessage(gch.meetingId, "ChatRequestMessageHistoryReply", message);
		service.sendMessage(m);
	}

}
