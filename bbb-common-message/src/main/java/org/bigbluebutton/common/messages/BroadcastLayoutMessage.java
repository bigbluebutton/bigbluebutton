package org.bigbluebutton.common.messages;

import java.util.ArrayList;
import java.util.HashMap;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class BroadcastLayoutMessage implements ISubscribedMessage {
	public static final String BROADCAST_LAYOUT  = "broadcast_layout_message";
	public static final String VERSION = "0.0.1";
	
	public static final String SET_BY_USERID = "set_by_userid";
	public static final String LAYOUT = "layout";
	public static final String LOCKED = "locked";
	public static final String USERS = "users";
	
	public final String meetingId;
	public final String setByUserid;
	public final String layout;
	public final Boolean locked;
	public final ArrayList<String> users;
	
	public BroadcastLayoutMessage(String meetingId, String setByUserid, String layout, Boolean locked, ArrayList<String> users) {
		this.meetingId = meetingId;
		this.setByUserid = setByUserid;
		this.layout = layout;
		this.locked = locked;
		this.users = users;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(SET_BY_USERID, setByUserid);
		payload.put(LAYOUT, layout);
		payload.put(LOCKED, locked);
		payload.put(USERS, users);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(BROADCAST_LAYOUT, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static BroadcastLayoutMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (BROADCAST_LAYOUT.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(LOCKED)
							&& payload.has(SET_BY_USERID)
							&& payload.has(USERS)
							&& payload.has(LAYOUT)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String setByUserid = payload.get(SET_BY_USERID).getAsString();
						String layout = payload.get(LAYOUT).getAsString();
						Boolean locked = payload.get(LOCKED).getAsBoolean();
						JsonArray usersArr = (JsonArray) payload.get(USERS);
						
						Util util = new Util();
						
						ArrayList<String> users = util.extractUserids(usersArr);
						return new BroadcastLayoutMessage(id, setByUserid, layout, locked, users);					
					}
				} 
			}
		}
		return null;

	}
}
