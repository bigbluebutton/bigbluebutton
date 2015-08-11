package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class BroadcastLayoutRequestMessage implements ISubscribedMessage {
	public static final String BROADCAST_LAYOUT_REQUEST  = "broadcast_layout_request_message";
	public static final String VERSION = "0.0.1";
	
	public final static String LAYOUT = "layout";
	
	public final String meetingId;
	public final String userId;
	public final String layout;
	
	public BroadcastLayoutRequestMessage(String meetingId, String userId, String layout) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.layout = layout;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(Constants.USER_ID, userId);
		payload.put(LAYOUT, layout);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(BROADCAST_LAYOUT_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static BroadcastLayoutRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (BROADCAST_LAYOUT_REQUEST.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(LAYOUT)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						String layout = payload.get(LAYOUT).getAsString();
						return new BroadcastLayoutRequestMessage(id, userid, layout);					
					}
				} 
			}
		}
		return null;

	}
}
