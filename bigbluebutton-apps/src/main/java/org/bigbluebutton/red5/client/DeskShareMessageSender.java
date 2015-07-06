package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.common.messages.ChatKeyUtil;
import org.bigbluebutton.common.messages.DeskShareNotifyViewersRTMPEventMessage;
import org.bigbluebutton.red5.client.messaging.BroadcastClientMessage;
import org.bigbluebutton.red5.client.messaging.ConnectionInvokerService;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class DeskShareMessageSender {
	private ConnectionInvokerService service;
	
	public DeskShareMessageSender(ConnectionInvokerService service) {
		this.service = service;
	}

	public void handleDeskShareMessage(String message) {

		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				switch (messageName) {
					case DeskShareNotifyViewersRTMPEventMessage.DESK_SHARE_NOTIFY_VIEWERS_RTMP:
						DeskShareNotifyViewersRTMPEventMessage rtmp = DeskShareNotifyViewersRTMPEventMessage.fromJson(message);
						System.out.println("DESKSHARE_RTMP_BROADCAST_STARTED_MESSAGE:" + rtmp.toJson());

						if (rtmp != null) {
							processDeskShareNotifyViewersRTMPEventMessage(rtmp);
						}
						break;
				}
			}
		}
	}


	private void processDeskShareNotifyViewersRTMPEventMessage(DeskShareNotifyViewersRTMPEventMessage msg) {
		Map<String, Object> messageInfo = new HashMap<String, Object>();
		
		System.out.println("RedisPubSubMessageHandler - " + msg.toJson());
		System.out.println("RedisPubSubMessageHandler - processDeskShareNotifyViewersRTMPEventMessage \n" +msg.streamPath+ "\n");

		messageInfo.put(ChatKeyUtil.CHAT_TYPE, "PUBLIC_CHAT");
		messageInfo.put(ChatKeyUtil.FROM_USERID, "enm6bgnif0d4_2");
		messageInfo.put(ChatKeyUtil.FROM_USERNAME, "User 4526544");
		messageInfo.put(ChatKeyUtil.TO_USERID, "public_chat_userid");
		messageInfo.put(ChatKeyUtil.TO_USERNAME, "public_chat_username");
		messageInfo.put(ChatKeyUtil.FROM_TIME, "1.435851039645E12");
		messageInfo.put(ChatKeyUtil.FROM_TZ_OFFSET, "240");
		messageInfo.put(ChatKeyUtil.FROM_COLOR, "0");
		messageInfo.put(ChatKeyUtil.MESSAGE, "BROADCASTING_RTMP:"+msg.broadcasting + " " + msg.streamPath);

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "ChatReceivePublicMessageCommand", messageInfo);
		service.sendMessage(m);

		Map<String, Object> messageInfo2 = new HashMap<String, Object>();
		messageInfo2.put("rtmpUrl", msg.streamPath);
		messageInfo2.put("broadcasting", msg.broadcasting);
		BroadcastClientMessage m2 = new BroadcastClientMessage(msg.meetingId, "DeskShareRTMPBroadcastNotification", messageInfo2);
		System.out.println("A\n\n\n\nAAA" + m2.toString());
		service.sendMessage(m2);
		System.out.println("A\n\n\n\nAAA" + messageInfo2.toString());

	}
	

}
