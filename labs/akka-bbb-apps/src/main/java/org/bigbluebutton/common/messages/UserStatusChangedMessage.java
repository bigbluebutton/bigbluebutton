package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class UserStatusChangedMessage implements ISubscribedMessage {
	public static final String USER_STATUS_CHANGED  = "user_status_changed_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String userId;
	public final String status;
	public final String value;

	public UserStatusChangedMessage(String meetingId, String userId, String status, 
			String value) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.status = status;
		this.value = value;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(Constants.USER_ID, userId);
		payload.put(Constants.STATUS, status);
		payload.put(Constants.VALUE, value);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_STATUS_CHANGED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static UserStatusChangedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (USER_STATUS_CHANGED.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.STATUS)
							&& payload.has(Constants.VALUE)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						String status = payload.get(Constants.STATUS).getAsString();
						String value = payload.get(Constants.VALUE).getAsString();
						return new UserStatusChangedMessage(id, userid, status, value);					
					}
				} 
			}
		}
		return null;

	}
}
