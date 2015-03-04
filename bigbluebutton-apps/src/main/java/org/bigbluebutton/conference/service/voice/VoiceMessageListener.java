package org.bigbluebutton.conference.service.voice;

import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;
import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

import java.util.Map;
import java.util.HashMap;

import org.bigbluebutton.core.api.IBigBlueButtonInGW;

public class VoiceMessageListener implements MessageHandler{

	private IBigBlueButtonInGW bbbGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_VOICE_CHANNEL)) {

			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			JsonObject headerObject = (JsonObject) obj.get("header");
			JsonObject payloadObject = (JsonObject) obj.get("payload");

			String eventName = headerObject.get("name").toString().replace("\"", "");

			if (eventName.equalsIgnoreCase(MessagingConstants.MUTE_USER_REQUEST)){

				String meetingID = payloadObject.get("meeting_id").toString().replace("\"", "");
				String requesterID = payloadObject.get("requester_id").toString().replace("\"", "");
				String userID = payloadObject.get("userid").toString().replace("\"", "");
				String muteString = payloadObject.get(VoiceKeyUtil.MUTE).toString().replace("\"", "");
				Boolean mute = Boolean.valueOf(muteString);

				System.out.println("handling mute_user_request");
				bbbGW.muteUser(meetingID, requesterID, userID, mute);
			}
			else if (eventName.equalsIgnoreCase(MessagingConstants.USER_LEFT_VOICE_REQUEST)){

				String meetingID = payloadObject.get("meeting_id").toString().replace("\"", "");
				String userID = payloadObject.get("userid").toString().replace("\"", "");

				System.out.println("handling user_left_voice_request");
				bbbGW.voiceUserLeft(meetingID, userID);
			}
		}
	}
}
