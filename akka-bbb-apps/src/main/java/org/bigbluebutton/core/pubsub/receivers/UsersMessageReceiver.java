
package org.bigbluebutton.core.pubsub.receivers;

import org.bigbluebutton.common.messages.*;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import org.bigbluebutton.messages.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class UsersMessageReceiver implements MessageHandler{
	private static final Logger LOG = LoggerFactory.getLogger(UsersMessageReceiver.class);

	private IBigBlueButtonInGW bbbInGW;
	
	public UsersMessageReceiver(IBigBlueButtonInGW bbbInGW) {
		this.bbbInGW = bbbInGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_USERS_CHANNEL)) {
			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");

				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
					switch (messageName) {
					  case SetRecordingStatusRequestMessage.SET_RECORDING_STATUS_REQUEST:
						  processSetRecordingStatusRequestMessage(message);
						  break; 
					  case GetRecordingStatusRequestMessage.GET_RECORDING_STATUS_REQUEST:
						  processGetRecordingStatusRequestMessage(message);
						  break;
					}
				}
			}
		}
	}
	
	private void processSetRecordingStatusRequestMessage(String message) {
		SetRecordingStatusRequestMessage msg = SetRecordingStatusRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.setRecordingStatus(msg.meetingId, msg.userId, msg.recording);
		}
	}
	
	private void processGetRecordingStatusRequestMessage(String message) {
		GetRecordingStatusRequestMessage msg = GetRecordingStatusRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.getRecordingStatus(msg.meetingId, msg.userId);
		}
	}
}
