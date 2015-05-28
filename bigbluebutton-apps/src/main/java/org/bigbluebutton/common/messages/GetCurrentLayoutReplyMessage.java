package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class GetCurrentLayoutReplyMessage implements ISubscribedMessage {
	public static final String GET_CURRENT_LAYOUT_REPLY  = "get_current_layout_reply_message";
	public static final String VERSION = "0.0.1";
	
	public static final String SET_BY_USERID = "set_by_userid";
	public static final String REQUESTED_BY_USERID = "requested_by_userid";
	public static final String LAYOUT = "layout";
	public static final String LOCKED = "locked";
	
	public final String meetingId;
	public final String requestedByUserid;
	public final String setByUserid;
	public final String layout;
	public final Boolean locked;
	
	public GetCurrentLayoutReplyMessage(String meetingId, String requestedByUserid, String setByUserid, String layout, Boolean locked) {
		this.meetingId = meetingId;
		this.requestedByUserid = requestedByUserid;
		this.setByUserid = setByUserid;
		this.layout = layout;
		this.locked = locked;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(REQUESTED_BY_USERID, requestedByUserid);
		payload.put(SET_BY_USERID, setByUserid);
		payload.put(LAYOUT, layout);
		payload.put(LOCKED, locked);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(GET_CURRENT_LAYOUT_REPLY, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static GetCurrentLayoutReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (GET_CURRENT_LAYOUT_REPLY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(REQUESTED_BY_USERID)
							&& payload.has(SET_BY_USERID)
							&& payload.has(LOCKED)
							&& payload.has(LAYOUT)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String requestedByUserid = payload.get(REQUESTED_BY_USERID).getAsString();
						String setByUserid = payload.get(SET_BY_USERID).getAsString();
						String layout = payload.get(LAYOUT).getAsString();
						Boolean locked = payload.get(LOCKED).getAsBoolean();
						return new GetCurrentLayoutReplyMessage(id, requestedByUserid, setByUserid, layout, locked);					
					}
				} 
			}
		}
		return null;

	}
}
