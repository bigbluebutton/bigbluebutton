package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class IsMeetingMutedReplyMessage implements ISubscribedMessage {
	public static final String IS_MEETING_MUTED_REPLY  = "is_meeting_muted_reply_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String REQUESTER_ID = "requester_id";
	public static final String MUTED = "muted";
	
	public final String meetingId;
	public final String requesterId;
	public final Boolean muted;

	public IsMeetingMutedReplyMessage(String meetingId, String requesterId, Boolean muted) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.muted = muted;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(REQUESTER_ID, requesterId);
		payload.put(MUTED, muted);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(IS_MEETING_MUTED_REPLY, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static IsMeetingMutedReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (IS_MEETING_MUTED_REPLY.equals(messageName)) {
					if (payload.has(MEETING_ID) 
							&& payload.has(REQUESTER_ID)
							&& payload.has(MUTED)) {
						String id = payload.get(MEETING_ID).getAsString();
						String requesterId = payload.get(REQUESTER_ID).getAsString();
						Boolean muted = payload.get(MUTED).getAsBoolean();
						return new IsMeetingMutedReplyMessage(id, requesterId, muted);					
					}
				} 
			}
		}
		return null;

	}
}
