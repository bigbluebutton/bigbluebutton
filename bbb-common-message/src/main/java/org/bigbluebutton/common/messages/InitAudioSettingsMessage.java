package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class InitAudioSettingsMessage implements ISubscribedMessage {
	public static final String INIT_AUDIO_SETTING = "init_audio_settings_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final String userId;
	public final Boolean muted;
	
	public InitAudioSettingsMessage(String meetingID, String userId, Boolean muted) {
		this.meetingId = meetingID;
		this.userId = userId;
		this.muted = muted;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.USER_ID, userId);
		payload.put(Constants.MUTED, muted);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(INIT_AUDIO_SETTING, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	public static InitAudioSettingsMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (INIT_AUDIO_SETTING.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.MUTED)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String userId = payload.get(Constants.USER_ID).getAsString();
						Boolean muted = payload.get(Constants.MUTED).getAsBoolean();
												
						return new InitAudioSettingsMessage(meetingID, userId, muted);										
					}
				}
			}
		}

		return null;
	}
}
