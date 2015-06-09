package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class EjectAllUsersFromVoiceConfRequestMessage {
	public static final String EJECT_ALL_VOICE_USERS_REQUEST  = "eject_all_users_from_voice_conf_request_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String VOICE_CONF_ID = "voice_conf_id";
	
	public final String meetingId;
	public final String voiceConfId;

	public EjectAllUsersFromVoiceConfRequestMessage(String meetingId, String voiceConfId) {
		this.meetingId = meetingId;
		this.voiceConfId = voiceConfId;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(VOICE_CONF_ID, voiceConfId);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(EJECT_ALL_VOICE_USERS_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static EjectAllUsersFromVoiceConfRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (EJECT_ALL_VOICE_USERS_REQUEST.equals(messageName)) {
					if (payload.has(MEETING_ID) 
							&& payload.has(VOICE_CONF_ID)) {
						String id = payload.get(MEETING_ID).getAsString();
						String voiceConfId = payload.get(VOICE_CONF_ID).getAsString();
						return new EjectAllUsersFromVoiceConfRequestMessage(id, voiceConfId);					
					}
				} 
			}
		}
		return null;

	}
}
