package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class LockLayoutRequestMessage implements ISubscribedMessage {
	public static final String LOCK_LAYOUT_REQUEST  = "lock_layout_request_message";
	public static final String VERSION = "0.0.1";
	
	public final static String LAYOUT = "layout";
	public final static String LOCK = "lock";
	public final static String VIEWERS_ONLY = "viewers_only";
	
	public final String meetingId;
	public final String userId;
	public final Boolean lock;
	public final Boolean viewersOnly;
	
	
	public final String layout;
	
	public LockLayoutRequestMessage(String meetingId, String userId, Boolean lock, Boolean viewersOnly, String layout) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.lock = lock;
		this.viewersOnly = viewersOnly;
		this.layout = layout;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(Constants.USER_ID, userId);
		payload.put(LOCK, lock);
		payload.put(VIEWERS_ONLY, viewersOnly);
		payload.put(LAYOUT, layout);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(LOCK_LAYOUT_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static LockLayoutRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (LOCK_LAYOUT_REQUEST.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(LOCK)
							&& payload.has(VIEWERS_ONLY)
							&& payload.has(LAYOUT)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						Boolean lock = payload.get(LOCK).getAsBoolean();
						Boolean viewersOnly = payload.get(VIEWERS_ONLY).getAsBoolean();
						String layout = payload.get(LAYOUT).getAsString();
						return new LockLayoutRequestMessage(id, userid, lock, viewersOnly, layout);					
					}
				} 
			}
		}
		return null;

	}
}
