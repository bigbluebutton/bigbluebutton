package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class EjectUserFromMeetingRequestMessage implements ISubscribedMessage {
	public static final String EJECT_USER_FROM_MEETING_REQUEST  = "eject_user_from_meeting_request_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String userId;
	public final String ejectedBy;
	
	private static final String EJECTED_BY = "ejected_by";
	
	public EjectUserFromMeetingRequestMessage(String meetingId, String userId, String ejectedBy) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.ejectedBy = ejectedBy;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(Constants.USER_ID, userId);
		payload.put(EJECTED_BY, ejectedBy);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(EJECT_USER_FROM_MEETING_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static EjectUserFromMeetingRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (EJECT_USER_FROM_MEETING_REQUEST.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(EJECTED_BY)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						String ejectedBy = payload.get(EJECTED_BY).getAsString();
						return new EjectUserFromMeetingRequestMessage(id, userid, ejectedBy);					
					}
				} 
			}
		}
		return null;
	}
}
