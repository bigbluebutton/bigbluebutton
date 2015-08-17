package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class GetRecordingStatusRequestMessage implements ISubscribedMessage {
	public static final String GET_RECORDING_STATUS_REQUEST  = "get_recording_status_request_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String userId;
	
	public GetRecordingStatusRequestMessage(String meetingId, String userId) {
		this.meetingId = meetingId;
		this.userId = userId;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(Constants.USER_ID, userId);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(GET_RECORDING_STATUS_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static GetRecordingStatusRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (GET_RECORDING_STATUS_REQUEST.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						return new GetRecordingStatusRequestMessage(id, userid);				
					}
				} 
			}
		}
		return null;

	}
}
