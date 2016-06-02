package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class PollHideResultMessage implements ISubscribedMessage {
	public static final String POLL_HIDE_RESULT  = "poll_hide_result_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String POLL_ID = "poll_id";
	
	public final String meetingId;
	public final String pollId;
	
	public PollHideResultMessage(String meetingId, String pollId) {
		this.meetingId = meetingId;
		this.pollId = pollId;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(POLL_ID, pollId);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(POLL_HIDE_RESULT, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static PollHideResultMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (POLL_HIDE_RESULT.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(POLL_ID)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();						
						String pollId = payload.get(POLL_ID).getAsString();
											
						return new PollHideResultMessage(id, pollId);					
					}
				} 
			}
		}
		return null;

	}
}
