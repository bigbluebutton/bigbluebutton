package org.bigbluebutton.core.pubsub.receivers;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.bigbluebutton.common.messages.DeskShareStartedEventMessage;
import org.bigbluebutton.common.messages.DeskShareStoppedEventMessage;
import org.bigbluebutton.common.messages.DeskShareRTMPBroadcastStartedEventMessage;
import org.bigbluebutton.common.messages.DeskShareRTMPBroadcastStoppedEventMessage;
import org.bigbluebutton.common.messages.DeskShareGetInfoRequestMessage;
import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;

public class DeskShareMessageReceiver implements MessageHandler {

	private IBigBlueButtonInGW bbbGW;
	private static final Logger log = LoggerFactory.getLogger(DeskShareMessageReceiver.class);
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

					if (DeskShareStartedEventMessage.DESKSHARE_STARTED_MESSAGE.equals(messageName)) {
						DeskShareStartedEventMessage msg = DeskShareStartedEventMessage.fromJson(message);
						log.info("^^^^^^^DESKSHARE STARTED^^^^^^");
						bbbGW.deskShareStarted(msg.conferenceName, msg.callerId, msg.callerIdName);
					} else if (DeskShareStoppedEventMessage.DESK_SHARE_STOPPED_MESSAGE.equals(messageName)) {
						DeskShareStoppedEventMessage msg = DeskShareStoppedEventMessage.fromJson(message);
						log.info("^^^^^^^DESKSHARE STOPPED^^^^^^");
						bbbGW.deskShareStopped(msg.conferenceName, msg.callerId, msg.callerIdName);
					} else if (DeskShareRTMPBroadcastStartedEventMessage.DESKSHARE_RTMP_BROADCAST_STARTED_MESSAGE.equals(messageName)) {
						log.info("^^^^^^^DESKSHARE_RTMP_BROADCAST_STARTED_MESSAGE^^^^^^");
						DeskShareRTMPBroadcastStartedEventMessage msg = DeskShareRTMPBroadcastStartedEventMessage.fromJson(message);
						bbbGW.deskShareRTMPBroadcastStarted(msg.conferenceName, msg.streamname, msg.vw, msg.vh, msg.timestamp);
					} else if (DeskShareRTMPBroadcastStoppedEventMessage.DESKSHARE_RTMP_BROADCAST_STOPPED_MESSAGE.equals(messageName)) {
						log.info("^^^^^^^DESKSHARE_RTMP_BROADCAST_STOPPED_MESSAGE^^^^^^");
						DeskShareRTMPBroadcastStoppedEventMessage msg = DeskShareRTMPBroadcastStoppedEventMessage.fromJson(message);
						bbbGW.deskShareRTMPBroadcastStopped(msg.conferenceName, msg.streamname, msg.vw, msg.vh, msg.timestamp);
					} else if (DeskShareGetInfoRequestMessage.GET_DESKTOP_SHARE_GET_INFO_REQUEST.equals(messageName)) {
						log.info("^^^^^^^GET_DESKTOP_SHARE_INFO_REQUEST^^^^^^");
						DeskShareGetInfoRequestMessage msg = DeskShareGetInfoRequestMessage.fromJson(message);
						bbbGW.deskShareGetInfoRequest(msg.meetingId, msg.requesterId, msg.replyTo);
					}
				}
			}
		}
	}
}
