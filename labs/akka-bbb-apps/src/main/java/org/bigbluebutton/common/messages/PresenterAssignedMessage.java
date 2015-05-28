package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class PresenterAssignedMessage implements ISubscribedMessage {
	public static final String PRESENTER_ASSIGNED  = "presenter_assigned_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String newPresenterId;
	public final String newPresenterName;
	public final String assignedBy;

	public PresenterAssignedMessage(String meetingId, String newPresenterId, String newPresenterName, 
			String assignedBy) {
		this.meetingId = meetingId;
		this.newPresenterId = newPresenterId;
		this.newPresenterName = newPresenterName;
		this.assignedBy = assignedBy;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(Constants.NEW_PRESENTER_ID, newPresenterId);
		payload.put(Constants.NEW_PRESENTER_NAME, newPresenterName);
		payload.put(Constants.ASSIGNED_BY, assignedBy);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(PRESENTER_ASSIGNED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static PresenterAssignedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (PRESENTER_ASSIGNED.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.NEW_PRESENTER_ID)
							&& payload.has(Constants.NEW_PRESENTER_NAME)
							&& payload.has(Constants.ASSIGNED_BY)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String presenterId = payload.get(Constants.NEW_PRESENTER_ID).getAsString();
						String presenterName = payload.get(Constants.NEW_PRESENTER_NAME).getAsString();
						String assignedBy = payload.get(Constants.ASSIGNED_BY).getAsString();
						return new PresenterAssignedMessage(id, presenterId, presenterName, assignedBy);					
					}
				} 
			}
		}
		return null;

	}
}
