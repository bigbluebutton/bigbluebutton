package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.common.messages.DeskShareNotifyASingleViewerEventMessage;
import org.bigbluebutton.common.messages.DeskShareNotifyViewersRTMPEventMessage;
import org.bigbluebutton.red5.client.messaging.BroadcastClientMessage;
import org.bigbluebutton.red5.client.messaging.ConnectionInvokerService;
import org.bigbluebutton.red5.client.messaging.DirectClientMessage;

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

						if (rtmp != null) {
							processDeskShareNotifyViewersRTMPEventMessage(rtmp);
						}
						break;
					case DeskShareNotifyASingleViewerEventMessage.DESK_SHARE_NOTIFY_A_SINGLE_VIEWER:
						DeskShareNotifyASingleViewerEventMessage singleViewerMsg = DeskShareNotifyASingleViewerEventMessage.fromJson(message);
						if (singleViewerMsg != null) {
							processDeskShareNotifyASingleViewerEventMessage(singleViewerMsg);
						}
				}
			}
		}
	}


	private void processDeskShareNotifyViewersRTMPEventMessage(DeskShareNotifyViewersRTMPEventMessage msg) {
		Map<String, Object> messageInfo = new HashMap<String, Object>();

		// split the string streamPath if there are params in the format:
		// {channels=2,samplerate=48000,vw=1920,vh=1080,fps=5.00}rtmp://192.168.23.3/video-broadcast/.../..."
		String fullPathString = msg.streamPath;
		String delims = "[,{}]+";
		String[] arr = fullPathString.split(delims);
		String rtmpStreamPath = arr[arr.length -1];

		messageInfo.put("rtmpUrl", rtmpStreamPath);
		messageInfo.put("broadcasting", msg.broadcasting);
		messageInfo.put("width", msg.vw);
		messageInfo.put("height", msg.vh);

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "DeskShareRTMPBroadcastNotification", messageInfo);
		service.sendMessage(m);
	}

	private void processDeskShareNotifyASingleViewerEventMessage(DeskShareNotifyASingleViewerEventMessage msg) {
		Map<String, Object> messageInfo = new HashMap<String, Object>();

		messageInfo.put("rtmpUrl", msg.streamPath);
		messageInfo.put("broadcasting", msg.broadcasting);
		messageInfo.put("width", msg.vw);
		messageInfo.put("height", msg.vh);

		String toUserId = msg.userId;
		DirectClientMessage receiver = new DirectClientMessage(msg.meetingId, toUserId,
		 "DeskShareRTMPBroadcastNotification", messageInfo);
		service.sendMessage(receiver);
	}

}
