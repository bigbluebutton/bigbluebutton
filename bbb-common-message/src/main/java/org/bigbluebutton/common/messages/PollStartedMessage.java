package org.bigbluebutton.common.messages;

import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class PollStartedMessage implements ISubscribedMessage {
	public static final String POLL_STARTED  = "poll_started_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String REQUESTER_ID = "requester_id";
	public static final String POLL = "poll";
	
	public final String meetingId;
	public final String requesterId;
	public final Map<String, Object> poll;
	
	public PollStartedMessage(String meetingId, String requesterId, Map<String, Object> poll) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.poll = poll;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(REQUESTER_ID, requesterId);
		payload.put(POLL, poll);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(POLL_STARTED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static PollStartedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (POLL_STARTED.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(REQUESTER_ID)
							&& payload.has(POLL)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(REQUESTER_ID).getAsString();
						
						JsonObject poll = payload.get(POLL).getAsJsonObject();
						
						Util util = new Util();
						Map<String, Object> pollMap = util.decodeSimplePoll(poll);
						
						return new PollStartedMessage(id, requesterId, pollMap);					
					}
				} 
			}
		}
		return null;

	}
}
