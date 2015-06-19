package org.bigbluebutton.common.messages;

import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class UserVotedPollMessage implements ISubscribedMessage {
	public static final String USER_VOTED_POLL  = "user_voted_poll_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String PRESENTER_ID = "presenter_id";
	public static final String POLL = "poll";
	
	public final String meetingId;
	public final String presenterId;
	public final Map<String, Object> poll;
	
	public UserVotedPollMessage(String meetingId, String presenterId, Map<String, Object> poll) {
		this.meetingId = meetingId;
		this.presenterId = presenterId;
		this.poll = poll;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(PRESENTER_ID, presenterId);
		payload.put(POLL, poll);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_VOTED_POLL, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static UserVotedPollMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (USER_VOTED_POLL.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(PRESENTER_ID)
							&& payload.has(POLL)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String presenterId = payload.get(PRESENTER_ID).getAsString();
						
						JsonObject poll = payload.get(POLL).getAsJsonObject();
						
						Util util = new Util();
						Map<String, Object> pollMap = util.decodeSimplePollResult(poll);
						
						return new UserVotedPollMessage(id, presenterId, pollMap);					
					}
				} 
			}
		}
		return null;

	}
}
