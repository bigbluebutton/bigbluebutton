package org.bigbluebutton.red5.sub.messages;

import java.util.HashMap;
import org.bigbluebutton.red5.pub.messages.Constants;
import org.bigbluebutton.red5.pub.messages.MessageBuilder;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class UserRaisedHandMessage implements ISubscribedMessage {
	public static final String USER_RAISED_HAND  = "user_raised_hand_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String userId;
	public final Boolean raisedHand;

	public UserRaisedHandMessage(String meetingId, String userId, Boolean raisedHand) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.raisedHand = raisedHand;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(Constants.USER_ID, userId);
		payload.put(Constants.RAISE_HAND, raisedHand);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_RAISED_HAND, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static UserRaisedHandMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (USER_RAISED_HAND.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.RAISE_HAND)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						Boolean raisedHand = payload.get(Constants.RAISE_HAND).getAsBoolean();
						return new UserRaisedHandMessage(id, userid, raisedHand);					
					}
				} 
			}
		}
		return null;

	}
}
