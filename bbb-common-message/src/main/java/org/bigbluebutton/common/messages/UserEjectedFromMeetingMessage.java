package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class UserEjectedFromMeetingMessage implements ISubscribedMessage {
	public static final String USER_EJECTED_FROM_MEETING  = "user_eject_from_meeting";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String userId;
	public final String ejectedBy;

	
	public UserEjectedFromMeetingMessage(String meetingId, String userId, String ejectedBy) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.ejectedBy = ejectedBy;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(Constants.USER_ID, userId);
		payload.put(Constants.EJECTED_BY, ejectedBy);
		
			
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_EJECTED_FROM_MEETING, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static UserEjectedFromMeetingMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (USER_EJECTED_FROM_MEETING.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.EJECTED_BY)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						String ejectedBy = payload.get(Constants.EJECTED_BY).getAsString();
						return new UserEjectedFromMeetingMessage(id, userid, ejectedBy);					
					}
				} 
			}
		}
		return null;

	}
}
