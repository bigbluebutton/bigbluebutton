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
		System.out.println("RedisPubSubMessageHandler - processDeskShareNotifyViewersRTMPEventMessage \n" +msg.streamPath+ "\n");

		messageInfo.put("rtmpUrl", msg.streamPath);
		messageInfo.put("broadcasting", msg.broadcasting);
		messageInfo.put("width", msg.vw);
		messageInfo.put("height", msg.vh);
		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "DeskShareRTMPBroadcastNotification", messageInfo);
		service.sendMessage(m);
	}

}
