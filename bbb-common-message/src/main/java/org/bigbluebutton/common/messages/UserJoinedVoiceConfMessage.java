package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class UserJoinedVoiceConfMessage {
	public static final String USER_JOINED_VOICE_CONF  = "user_joined_voice_conf_message";
	public static final String VERSION = "0.0.1";
	
	public static final String VOICE_CONF_ID = "voice_conf_id";
	public static final String VOICE_USER_ID = "voice_user_id";
	public static final String USER_ID = "user_id";
	public static final String CALLER_ID_NAME = "caller_id_name";
	public static final String CALLER_ID_NUM = "caller_id_num";
	public static final String MUTED = "muted";
	public static final String TALKING = "talking";
	public static final String AVATAR_URL = "avatarURL";
	
	public final String voiceConfId;
	public final String voiceUserId;
	public final String userId;
	public final String callerIdName;
	public final String callerIdNum;
	public final Boolean muted;
	public final Boolean talking;
	public final String avatarURL;
	
	public UserJoinedVoiceConfMessage(String voiceConfId, String voiceUserId, String userId,
			String callerIdName, String callerIdNum, Boolean muted, Boolean talking, String avatarURL) {
		this.voiceConfId = voiceConfId;
		this.voiceUserId = voiceUserId;
		this.userId = userId;
		this.callerIdName = callerIdName;
		this.callerIdNum = callerIdNum;
		this.muted = muted;
		this.talking = talking;
		this.avatarURL = avatarURL;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(VOICE_CONF_ID, voiceConfId);
		payload.put(VOICE_USER_ID, voiceUserId); 
		payload.put(USER_ID, userId); 
		payload.put(CALLER_ID_NAME, callerIdName);
		payload.put(CALLER_ID_NUM, callerIdNum);
		payload.put(MUTED, muted);
		payload.put(TALKING, talking);
		payload.put(AVATAR_URL, avatarURL);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_JOINED_VOICE_CONF, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static UserJoinedVoiceConfMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (USER_JOINED_VOICE_CONF.equals(messageName)) {
					if (payload.has(VOICE_CONF_ID) 
							&& payload.has(VOICE_USER_ID)
							&& payload.has(USER_ID)
							&& payload.has(CALLER_ID_NAME)
							&& payload.has(CALLER_ID_NUM)
							&& payload.has(MUTED)
							&& payload.has(TALKING) 
							&& payload.has(AVATAR_URL)) {
						String voiceConfId = payload.get(VOICE_CONF_ID).getAsString();
						String voiceUserId = payload.get(VOICE_USER_ID).getAsString();
						String userId = payload.get(USER_ID).getAsString();
						String callerIdName = payload.get(CALLER_ID_NAME).getAsString();
						String callerIdNum = payload.get(CALLER_ID_NUM).getAsString();
						Boolean muted = payload.get(MUTED).getAsBoolean();
						Boolean talking = payload.get(TALKING).getAsBoolean();
						String avatarURL = payload.get(AVATAR_URL).getAsString();
						return new UserJoinedVoiceConfMessage(voiceConfId, voiceUserId, userId, callerIdName, callerIdNum, muted, talking, avatarURL);
					}
				} 
			}
		}
		return null;

	}
}
