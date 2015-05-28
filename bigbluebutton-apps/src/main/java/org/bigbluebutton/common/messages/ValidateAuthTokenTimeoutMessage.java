package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class ValidateAuthTokenTimeoutMessage implements ISubscribedMessage {
	public static final String VALIDATE_AUTH_TOKEN_TIMEOUT  = "validate_auth_token_timeout";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String userId;
	public final String token;
	public final String replyTo;
	public final Boolean valid;
	
	public ValidateAuthTokenTimeoutMessage(String meetingId, String userId, String token, 
			Boolean valid, String replyTo) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.token = token;
		this.replyTo = replyTo;
		this.valid = valid;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.REPLY_TO, replyTo);
		payload.put(Constants.VALID, valid);
		payload.put(Constants.USER_ID, userId);
		payload.put(Constants.AUTH_TOKEN, token);
		payload.put(Constants.MEETING_ID, meetingId); 
			
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(VALIDATE_AUTH_TOKEN_TIMEOUT, VERSION, replyTo);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static ValidateAuthTokenTimeoutMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (VALIDATE_AUTH_TOKEN_TIMEOUT.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.AUTH_TOKEN)
							&& payload.has(Constants.VALID)
							&& payload.has(Constants.REPLY_TO)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						String authToken = payload.get(Constants.AUTH_TOKEN).getAsString();
						String replyTo = payload.get(Constants.REPLY_TO).getAsString();
						Boolean valid = payload.get(Constants.VALID).getAsBoolean();
						return new ValidateAuthTokenTimeoutMessage(id, userid, authToken, valid, replyTo);					
					}
				} 
			}
		}
		return null;

	}
}
