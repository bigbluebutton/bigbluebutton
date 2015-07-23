package org.bigbluebutton.common.messages;

import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class PollCreatedMessage implements ISubscribedMessage {
	public static final String POLL_CREATED  = "poll_created_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String REQUESTER_ID = "requester_id";
	public static final String POLL_ID = "poll_id";
	public static final String POLL = "poll";
	
	public final String meetingId;
	public final String requesterId;
	public final String pollId;
	public final Map<String, Object> poll;
	
	public PollCreatedMessage(String meetingId, String requesterId, String pollId, Map<String, Object> poll) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.pollId = pollId;
		this.poll = poll;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(REQUESTER_ID, requesterId);
		payload.put(POLL_ID, pollId);
		payload.put(POLL, poll);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(POLL_CREATED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static PollCreatedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (POLL_CREATED.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(REQUESTER_ID)
							&& payload.has(POLL_ID)
							&& payload.has(POLL)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(REQUESTER_ID).getAsString();
						String pollId = payload.get(POLL_ID).getAsString();
						JsonObject poll = payload.get(POLL).getAsJsonObject();

						Map<String, Object> pollMap = decodePoll(poll);
						return new PollCreatedMessage(id, requesterId, pollId, pollMap);					
					}
				} 
			}
		}
		return null;

	}
	
	public static final String ID = "id";
	public static final String QUESTIONS = "questions";
	public static final String QUESTION = "question";
	public static final String ANSWERS = "answers";
	public static final String ANSWER = "answer";
	public static final String NUM_VOTES = "num_votes";
	
	private static Map<String, Object> decodePoll(JsonObject poll) {
		Map<String, Object> pollMap = new HashMap<String, Object>();
		
		if (poll.has(ID) && poll.has(QUESTIONS)) {
			String id = poll.get(ID).getAsString();
			JsonArray qArray = poll.get(QUESTIONS).getAsJsonArray();
			
		}
		
		return pollMap;
	}
}
