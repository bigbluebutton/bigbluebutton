package org.bigbluebutton.core.pubsub.receivers;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

import org.bigbluebutton.common.messages.DeskShareStartedEventMessage;
import org.bigbluebutton.common.messages.DeskShareEndedEventMessage;
import org.bigbluebutton.common.messages.DeskShareViewerJoinedEventMessage;
import org.bigbluebutton.common.messages.DeskShareViewerLeftEventMessage;
import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;

public class DeskShareMessageReceiver implements MessageHandler {

	private IBigBlueButtonInGW bbbGW;
	
	public DeskShareMessageReceiver(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.FROM_VOICE_CONF_SYSTEM_CHAN)) {
			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");
				if (header.has("name")) {
					String messageName = header.get("name").getAsString();

					if (DeskShareStartedEventMessage.DESK_SHARE_STARTED_MESSAGE.equals(messageName)) {
						DeskShareStartedEventMessage msg = DeskShareStartedEventMessage.fromJson(message);
//						// TODO
					} else if (DeskShareEndedEventMessage.DESK_SHARE_ENDED_MESSAGE.equals(messageName)) {
						DeskShareEndedEventMessage msg = DeskShareEndedEventMessage.fromJson(message);
//						// TODO
					} else if (DeskShareViewerJoinedEventMessage.DESK_SHARE_VIEWER_JOINED_MESSAGE.equals(messageName)) {
						DeskShareViewerJoinedEventMessage msg = DeskShareViewerJoinedEventMessage.fromJson(message);
//						// TODO
					} else if (DeskShareViewerLeftEventMessage.DESK_SHARE_VIEWER_LEFT_MESSAGE.equals(messageName)) {
						DeskShareViewerLeftEventMessage msg = DeskShareViewerLeftEventMessage.fromJson(message);
//						// TODO
					}
				}
			}
		}
	}
}
