package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class EjectUserFromVoiceRequestMessage implements ISubscribedMessage {
	public static final String EJECT_USER_FROM_VOICE_REQUEST  = "eject_user_from_voice_request_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String REQUESTER_ID = "requester_id";
	public static final String USER_ID = "user_id";
	
	public final String meetingId;
	public final String requesterId;
	public final String userId;

	public EjectUserFromVoiceRequestMessage(String meetingId, String requesterId, String userId) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.userId = userId;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(REQUESTER_ID, requesterId);
		payload.put(USER_ID, userId);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(EJECT_USER_FROM_VOICE_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static EjectUserFromVoiceRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (EJECT_USER_FROM_VOICE_REQUEST.equals(messageName)) {
					if (payload.has(MEETING_ID) 
							&& payload.has(REQUESTER_ID)
							&& payload.has(USER_ID)) {
						String id = payload.get(MEETING_ID).getAsString();
						String requesterId = payload.get(REQUESTER_ID).getAsString();
						String userId = payload.get(USER_ID).getAsString();
						return new EjectUserFromVoiceRequestMessage(id, requesterId, userId);					
					}
				} 
			}
		}
		return null;

	}
}
