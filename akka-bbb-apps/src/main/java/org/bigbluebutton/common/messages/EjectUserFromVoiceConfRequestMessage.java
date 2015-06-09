package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class EjectUserFromVoiceConfRequestMessage {
	public static final String EJECT_VOICE_USER_REQUEST  = "eject_user_from_voice_conf_request_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String VOICE_CONF_ID = "voice_conf_id";
	public static final String VOICE_USER_ID = "voice_user_id";
	
	public final String meetingId;
	public final String voiceConfId;
	public final String voiceUserId;

	public EjectUserFromVoiceConfRequestMessage(String meetingId, String voiceConfId, String voiceUserId) {
		this.meetingId = meetingId;
		this.voiceConfId = voiceConfId;
		this.voiceUserId = voiceUserId;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(VOICE_CONF_ID, voiceConfId);
		payload.put(VOICE_USER_ID, voiceUserId);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(EJECT_VOICE_USER_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static EjectUserFromVoiceConfRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (EJECT_VOICE_USER_REQUEST.equals(messageName)) {
					if (payload.has(MEETING_ID) 
							&& payload.has(VOICE_CONF_ID)
							&& payload.has(VOICE_USER_ID)) {
						String id = payload.get(MEETING_ID).getAsString();
						String voiceConfId = payload.get(VOICE_CONF_ID).getAsString();
						String voiceUserId = payload.get(VOICE_USER_ID).getAsString();
						return new EjectUserFromVoiceConfRequestMessage(id, voiceConfId, voiceUserId);					
					}
				} 
			}
		}
		return null;

	}
}
