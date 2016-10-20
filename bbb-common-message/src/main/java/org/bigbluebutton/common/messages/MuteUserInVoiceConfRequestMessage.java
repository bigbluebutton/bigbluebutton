package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class MuteUserInVoiceConfRequestMessage {
	public static final String MUTE_VOICE_USER_REQUEST  = "mute_user_in_voice_conf_request_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String VOICE_CONF_ID = "voice_conf_id";
	public static final String VOICE_USER_ID = "voice_user_id";
	public static final String MUTE = "mute";
	
	public final String meetingId;
	public final String voiceConfId;
	public final String voiceUserId;
	public final Boolean mute;

	public MuteUserInVoiceConfRequestMessage(String meetingId, String voiceConfId, String voiceUserId, Boolean mute) {
		this.meetingId = meetingId;
		this.voiceConfId = voiceConfId;
		this.voiceUserId = voiceUserId;
		this.mute = mute;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(VOICE_CONF_ID, voiceConfId);
		payload.put(VOICE_USER_ID, voiceUserId);
		payload.put(MUTE, mute);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(MUTE_VOICE_USER_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static MuteUserInVoiceConfRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (MUTE_VOICE_USER_REQUEST.equals(messageName)) {
					if (payload.has(MEETING_ID) 
							&& payload.has(VOICE_CONF_ID)
							&& payload.has(VOICE_USER_ID)
							&& payload.has(MUTE)) {
						String id = payload.get(MEETING_ID).getAsString();
						String voiceConfId = payload.get(VOICE_CONF_ID).getAsString();
						String voiceUserId = payload.get(VOICE_USER_ID).getAsString();
						Boolean mute = payload.get(MUTE).getAsBoolean();
						return new MuteUserInVoiceConfRequestMessage(id, voiceConfId, voiceUserId, mute);					
					}
				} 
			}
		}
		return null;
	}
}
