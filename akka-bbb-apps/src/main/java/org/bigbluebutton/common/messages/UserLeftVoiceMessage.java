package org.bigbluebutton.common.messages;

import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class UserLeftVoiceMessage implements ISubscribedMessage {
	public static final String USER_LEFT_VOICE  = "user_left_voice_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final Map<String, Object> user;
	public final String voiceConf;
	
	public UserLeftVoiceMessage(String meetingId, Map<String, Object> user, String voiceConf) {
		this.meetingId = meetingId;
		this.user = user;
		this.voiceConf = voiceConf;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(Constants.USER, user);
		payload.put(Constants.VOICE_CONF, voiceConf);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_LEFT_VOICE, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static UserLeftVoiceMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (USER_LEFT_VOICE.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String voiceConf = payload.get(Constants.VOICE_CONF).getAsString();
						
						JsonObject user = (JsonObject) payload.get(Constants.USER);
						
						Util util = new Util();
						Map<String, Object> userMap = util.extractUser(user);
						
						if (userMap != null) {
							return new UserLeftVoiceMessage(id, userMap, voiceConf);						
						}				
					}
				} 
			}
		}
		return null;

	}
}
