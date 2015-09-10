package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class UserEmojiStatusMessage implements ISubscribedMessage {
	public static final String USER_EMOJI_STATUS  = "user_emoji_status_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String userId;
	public final String emojiStatus;

	public UserEmojiStatusMessage(String meetingId, String userId, String emojiStatus) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.emojiStatus = emojiStatus;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(Constants.USER_ID, userId);
		payload.put(Constants.EMOJI_STATUS, emojiStatus);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_EMOJI_STATUS, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static UserEmojiStatusMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (USER_EMOJI_STATUS.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.EMOJI_STATUS)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						String emojiStatus = payload.get(Constants.EMOJI_STATUS).getAsString();
						return new UserEmojiStatusMessage(id, userid, emojiStatus);					
					}
				} 
			}
		}
		return null;

	}
}
