package org.bigbluebutton.voiceconf.messaging.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.bigbluebutton.voiceconf.messaging.Constants;
import org.bigbluebutton.voiceconf.messaging.MessageBuilder;


public class UserDisconnectedFromGlobalAudio {
	public static final String USER_DISCONNECTED_FROM_GLOBAL_AUDIO = "user_disconnected_from_global_audio";
	public static final String VERSION = "0.0.1";

	public final String voiceConf;
	public final String name;
	public final String userid;
	
	public UserDisconnectedFromGlobalAudio(String voiceConf, String userid, String name) {
		this.voiceConf = voiceConf;
		this.userid = userid;
		this.name = name;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.VOICE_CONF, voiceConf);
    payload.put(Constants.USER_ID, userid);
    payload.put(Constants.NAME, name);		
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_DISCONNECTED_FROM_GLOBAL_AUDIO, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static UserDisconnectedFromGlobalAudio fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (messageName == USER_DISCONNECTED_FROM_GLOBAL_AUDIO) {
					if (payload.has(Constants.VOICE_CONF) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.NAME)) {
						String voiceConf = payload.get(Constants.VOICE_CONF).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						String name = payload.get(Constants.NAME).getAsString();
						return new UserDisconnectedFromGlobalAudio(voiceConf, userid, name);						
					}
				}
			}
		}
		return null;
	}
}
