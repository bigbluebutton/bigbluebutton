package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class UserListeningOnlyMessage implements ISubscribedMessage {
	public static final String USER_LISTENING_ONLY  = "user_listening_only";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String userId;
	public final Boolean listenOnly;

	public UserListeningOnlyMessage(String meetingId, String userId, Boolean listenOnly) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.listenOnly = listenOnly;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(Constants.USER_ID, userId);
		payload.put(Constants.LISTEN_ONLY, listenOnly);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_LISTENING_ONLY, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static UserListeningOnlyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (USER_LISTENING_ONLY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.LISTEN_ONLY)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						Boolean listenOnly = payload.get(Constants.LISTEN_ONLY).getAsBoolean();
						return new UserListeningOnlyMessage(id, userid, listenOnly);					
					}
				} 
			}
		}
		return null;

	}
}
