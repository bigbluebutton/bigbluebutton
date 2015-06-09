package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class UserLockedMessage implements ISubscribedMessage {
	public static final String USER_LOCKED  = "user_locked_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String userId;
	public final Boolean locked;

	public UserLockedMessage(String meetingId, String userId, Boolean locked) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.locked = locked;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(Constants.USER_ID, userId);
		payload.put(Constants.LOCKED, locked);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_LOCKED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static UserLockedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (USER_LOCKED.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.LOCKED)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						Boolean locked = payload.get(Constants.LOCKED).getAsBoolean();
						return new UserLockedMessage(id, userid, locked);					
					}
				} 
			}
		}
		return null;

	}
}
