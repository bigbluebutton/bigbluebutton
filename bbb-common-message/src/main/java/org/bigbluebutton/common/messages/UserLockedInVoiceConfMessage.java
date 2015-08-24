package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class UserLockedInVoiceConfMessage {
	public static final String USER_LOCKED_IN_VOICE_CONF  = "user_locked_in_voice_conf_message";
	public static final String VERSION = "0.0.1";
	
	public static final String VOICE_CONF_ID = "voice_conf_id";
	public static final String VOICE_USER_ID = "voice_user_id";
	public static final String LOCKED = "locked";
	
	public final String voiceConfId;
	public final String voiceUserId;
	public final Boolean locked;
	
	public UserLockedInVoiceConfMessage(String voiceConfId, String voiceUserId, Boolean locked) {
		this.voiceConfId = voiceConfId;
		this.voiceUserId = voiceUserId;
		this.locked = locked;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(VOICE_CONF_ID, voiceConfId);
		payload.put(VOICE_USER_ID, voiceUserId); 
		payload.put(LOCKED, locked); 
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_LOCKED_IN_VOICE_CONF, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static UserLockedInVoiceConfMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (USER_LOCKED_IN_VOICE_CONF.equals(messageName)) {
					if (payload.has(VOICE_CONF_ID) 
							&& payload.has(VOICE_USER_ID)
							&& payload.has(LOCKED)) {
						String voiceConfId = payload.get(VOICE_CONF_ID).getAsString();
						String voiceUserId = payload.get(VOICE_USER_ID).getAsString();	
						Boolean locked = payload.get(LOCKED).getAsBoolean();
						return new UserLockedInVoiceConfMessage(voiceConfId, voiceUserId, locked);					
					}
				} 
			}
		}
		return null;

	}
}
