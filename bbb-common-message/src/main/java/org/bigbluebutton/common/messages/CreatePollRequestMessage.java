package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class CreatePollRequestMessage implements ISubscribedMessage {
	public static final String CREATE_POLL_REQUEST  = "create_poll_request_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String REQUESTER_ID = "requester_id";
	public static final String POLL_ID = "poll_id";
	public static final String POLL_TYPE = "poll_type";
	
	public final String meetingId;
	public final String requesterId;
	public final String pollId;
	public final String pollType;
	
	public CreatePollRequestMessage(String meetingId, String requesterId, String pollId, String pollType) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.pollId = pollId;
		this.pollType = pollType;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(REQUESTER_ID, requesterId);
		payload.put(POLL_ID, pollId);
		payload.put(POLL_TYPE, pollType);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(CREATE_POLL_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static CreatePollRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (CREATE_POLL_REQUEST.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(REQUESTER_ID)
							&& payload.has(POLL_ID)
							&& payload.has(POLL_TYPE)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(REQUESTER_ID).getAsString();
						String pollId = payload.get(POLL_ID).getAsString();
						String pollType = payload.get(POLL_TYPE).getAsString();

						return new CreatePollRequestMessage(id, requesterId, pollId, pollType);					
					}
				} 
			}
		}
		return null;

	}
}
