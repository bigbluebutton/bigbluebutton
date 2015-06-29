package org.bigbluebutton.core.pubsub.receivers;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

import org.bigbluebutton.common.messages.DeskShareStartedEventMessage;
import org.bigbluebutton.common.messages.DeskShareStoppedEventMessage;
import org.bigbluebutton.common.messages.DeskShareViewerJoinedEventMessage;
import org.bigbluebutton.common.messages.DeskShareViewerLeftEventMessage;
import org.bigbluebutton.common.messages.DeskShareRecordingStartedEventMessage;
import org.bigbluebutton.common.messages.DeskShareRecordingStoppedEventMessage;
import org.bigbluebutton.common.messages.GetChatHistoryRequestMessage;
import org.bigbluebutton.common.messages.DeskShareRTMPBroadcastStartedEventMessage;
import org.bigbluebutton.common.messages.DeskShareRTMPBroadcastStoppedEventMessage;
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

					if (DeskShareStartedEventMessage.DESKSHARE_STARTED_MESSAGE.equals(messageName)) {
						DeskShareStartedEventMessage msg = DeskShareStartedEventMessage.fromJson(message);
						System.out.println("^^^^^^^DESKSHARE STARTED^^^^^^");
						bbbGW.deskShareStarted(msg.conferenceName, msg.callerId, msg.callerIdName);
					} else if (DeskShareStoppedEventMessage.DESK_SHARE_STOPPED_MESSAGE.equals(messageName)) {
						DeskShareStoppedEventMessage msg = DeskShareStoppedEventMessage.fromJson(message);
						System.out.println("^^^^^^^DESKSHARE STOPPED^^^^^^");
						bbbGW.deskShareStopped(msg.conferenceName, msg.callerId, msg.callerIdName);
					} else if (DeskShareRecordingStartedEventMessage.DESKSHARE_RECORDING_STARTED_MESSAGE.equals(messageName)) {
						System.out.println("^^^^^^^REC STARTED^^^^^^");
						DeskShareRecordingStartedEventMessage msg = DeskShareRecordingStartedEventMessage.fromJson(message);
						bbbGW.deskShareRecordingStarted(msg.conferenceName, msg.filename, msg.timestamp);
					} else if (DeskShareRecordingStoppedEventMessage.DESKSHARE_RECORDING_STOPPED_MESSAGE.equals(messageName)) {
						System.out.println("^^^^^^^REC STOPPED^^^^^^");
						DeskShareRecordingStoppedEventMessage msg = DeskShareRecordingStoppedEventMessage.fromJson(message);
						bbbGW.deskShareRecordingStopped(msg.conferenceName, msg.filename, msg.timestamp);
					} else if (DeskShareRTMPBroadcastStartedEventMessage.DESKSHARE_RTMP_BROADCAST_STARTED_MESSAGE.equals(messageName)) {
						System.out.println("^^^^^^^DESKSHARE_RTMP_BROADCAST_STARTED_MESSAGE^^^^^^");
						DeskShareRTMPBroadcastStartedEventMessage msg = DeskShareRTMPBroadcastStartedEventMessage.fromJson(message);
						bbbGW.deskShareRTMPBroadcastStarted(msg.conferenceName, msg.streamname, msg.timestamp);
					} else if (DeskShareRTMPBroadcastStoppedEventMessage.DESKSHARE_RTMP_BROADCAST_STOPPED_MESSAGE.equals(messageName)) {
						System.out.println("^^^^^^^DESKSHARE_RTMP_BROADCAST_STOPPED_MESSAGE^^^^^^");
						DeskShareRTMPBroadcastStoppedEventMessage msg = DeskShareRTMPBroadcastStoppedEventMessage.fromJson(message);
						bbbGW.deskShareRTMPBroadcastStopped(msg.conferenceName, msg.streamname, msg.timestamp);
					}
//					else if (DeskShareViewerJoinedEventMessage.DESK_SHARE_VIEWER_JOINED_MESSAGE.equals(messageName)) {
//						DeskShareViewerJoinedEventMessage msg = DeskShareViewerJoinedEventMessage.fromJson(message);
//						// TODO
//					}
//					else if (DeskShareViewerLeftEventMessage.DESK_SHARE_VIEWER_LEFT_MESSAGE.equals(messageName)) {
//						DeskShareViewerLeftEventMessage msg = DeskShareViewerLeftEventMessage.fromJson(message);
//						// TODO
//					}
				}
			}
		}
	}
}
