package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class IsMeetingMutedRequestMessage implements ISubscribedMessage {
	public static final String IS_MEETING_MUTED_REQUEST  = "is_meeting_muted_request_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String REQUESTER_ID = "requester_id";
	
	public final String meetingId;
	public final String requesterId;

	public IsMeetingMutedRequestMessage(String meetingId, String requesterId) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(REQUESTER_ID, requesterId);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(IS_MEETING_MUTED_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static IsMeetingMutedRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (IS_MEETING_MUTED_REQUEST.equals(messageName)) {
					if (payload.has(MEETING_ID) 
							&& payload.has(REQUESTER_ID)) {
						String id = payload.get(MEETING_ID).getAsString();
						String requesterId = payload.get(REQUESTER_ID).getAsString();
						return new IsMeetingMutedRequestMessage(id, requesterId);					
					}
				} 
			}
		}
		return null;

	}
}
