package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class MuteAllExceptPresenterRequestMessage implements ISubscribedMessage {
	public static final String MUTE_ALL_EXCEPT_PRESENTER_REQUEST  = "mute_all_except_presenter_request_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String REQUESTER_ID = "requester_id";
	public static final String MUTE = "mute";
	
	public final String meetingId;
	public final String requesterId;
	public final Boolean mute;

	public MuteAllExceptPresenterRequestMessage(String meetingId, String requesterId, Boolean mute) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.mute = mute;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(REQUESTER_ID, requesterId);
		payload.put(MUTE, mute);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(MUTE_ALL_EXCEPT_PRESENTER_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static MuteAllExceptPresenterRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (MUTE_ALL_EXCEPT_PRESENTER_REQUEST.equals(messageName)) {
					if (payload.has(MEETING_ID) 
							&& payload.has(REQUESTER_ID)
							&& payload.has(MUTE)) {
						String id = payload.get(MEETING_ID).getAsString();
						String requesterId = payload.get(REQUESTER_ID).getAsString();
						Boolean mute = payload.get(MUTE).getAsBoolean();
						return new MuteAllExceptPresenterRequestMessage(id, requesterId, mute);					
					}
				} 
			}
		}
		return null;

	}
}
