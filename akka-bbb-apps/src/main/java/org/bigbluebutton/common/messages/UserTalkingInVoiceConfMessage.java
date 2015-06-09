package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class UserTalkingInVoiceConfMessage {
	public static final String USER_TALKING_IN_VOICE_CONF  = "user_talking_in_voice_conf_message";
	public static final String VERSION = "0.0.1";
	
	public static final String VOICE_CONF_ID = "voice_conf_id";
	public static final String VOICE_USER_ID = "voice_user_id";
	public static final String TALKING = "talking";
	
	public final String voiceConfId;
	public final String voiceUserId;
	public final Boolean talking;
	
	public UserTalkingInVoiceConfMessage(String voiceConfId, String voiceUserId, Boolean talking) {
		this.voiceConfId = voiceConfId;
		this.voiceUserId = voiceUserId;
		this.talking = talking;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(VOICE_CONF_ID, voiceConfId);
		payload.put(VOICE_USER_ID, voiceUserId); 
		payload.put(TALKING, talking); 
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_TALKING_IN_VOICE_CONF, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static UserTalkingInVoiceConfMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (USER_TALKING_IN_VOICE_CONF.equals(messageName)) {
					if (payload.has(VOICE_CONF_ID) 
							&& payload.has(VOICE_USER_ID)
							&& payload.has(TALKING)) {
						String voiceConfId = payload.get(VOICE_CONF_ID).getAsString();
						String voiceUserId = payload.get(VOICE_USER_ID).getAsString();	
						Boolean talking = payload.get(TALKING).getAsBoolean();
						return new UserTalkingInVoiceConfMessage(voiceConfId, voiceUserId, talking);					
					}
				} 
			}
		}
		return null;

	}
}
