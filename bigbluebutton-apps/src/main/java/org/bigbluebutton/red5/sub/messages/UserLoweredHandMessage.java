package org.bigbluebutton.red5.sub.messages;

import java.util.HashMap;

import org.bigbluebutton.red5.pub.messages.Constants;
import org.bigbluebutton.red5.pub.messages.IPublishedMessage;
import org.bigbluebutton.red5.pub.messages.MessageBuilder;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class UserLoweredHandMessage implements ISubscribedMessage {
	public static final String USER_LOWERED_HAND  = "user_lowered_hand_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String userId;
	public final Boolean raisedHand;
	public final String loweredBy;
	
	public UserLoweredHandMessage(String meetingId, String userId, Boolean raisedHand, String loweredBy) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.raisedHand = raisedHand;
		this.loweredBy = loweredBy;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(Constants.USER_ID, userId);
		payload.put(Constants.RAISE_HAND, raisedHand);
		payload.put(Constants.LOWERED_BY, loweredBy);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_LOWERED_HAND, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static UserLoweredHandMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (USER_LOWERED_HAND.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.RAISE_HAND)
							&& payload.has(Constants.LOWERED_BY)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						Boolean raisedHand = payload.get(Constants.RAISE_HAND).getAsBoolean();
						String loweredBy = payload.get(Constants.LOWERED_BY).getAsString();
						return new UserLoweredHandMessage(id, userid, raisedHand, loweredBy);					
					}
				} 
			}
		}
		return null;

	}
}
