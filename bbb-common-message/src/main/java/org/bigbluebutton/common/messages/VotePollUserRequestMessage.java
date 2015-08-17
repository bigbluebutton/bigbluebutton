package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class VotePollUserRequestMessage implements ISubscribedMessage {
	public static final String VOTE_POLL_REQUEST  = "vote_poll_user_request_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String USER_ID = "user_id";
	public static final String POLL_ID = "poll_id";
	public static final String QUESTION_ID = "question_id";
	public static final String ANSWER_ID = "answer_id";
	
	public final String meetingId;
	public final String userId;
	public final String pollId;
	public final Integer questionId;
	public final Integer answerId;
	
	public VotePollUserRequestMessage(String meetingId, String userId, String pollId, Integer questionId, Integer answerId) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.pollId = pollId;
		this.questionId = questionId;
		this.answerId = answerId;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(USER_ID, userId);
		payload.put(POLL_ID, pollId);
		payload.put(QUESTION_ID, questionId);
		payload.put(ANSWER_ID, answerId);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(VOTE_POLL_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static VotePollUserRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (VOTE_POLL_REQUEST.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(USER_ID)
							&& payload.has(POLL_ID)
							&& payload.has(QUESTION_ID)
							&& payload.has(ANSWER_ID)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userId = payload.get(USER_ID).getAsString();
						String pollId = payload.get(POLL_ID).getAsString();
						Integer questionId = payload.get(QUESTION_ID).getAsInt();
						Integer answerId = payload.get(ANSWER_ID).getAsInt();
								
						return new VotePollUserRequestMessage(id, userId, pollId, questionId, answerId);					
					}
				} 
			}
		}
		return null;

	}
}
