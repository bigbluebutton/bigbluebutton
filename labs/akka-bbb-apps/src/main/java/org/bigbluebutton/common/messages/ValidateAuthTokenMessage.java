package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class ValidateAuthTokenMessage implements IPublishedMessage {
	public static final String VALIDATE_AUTH_TOKEN  = "validate_auth_token";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String userId;
	public final String token;
	public final String replyTo;
	public final String sessionId;
	
	public ValidateAuthTokenMessage(String meetingId, String userId, String token, String replyTo, String sessionId) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.token = token;
		this.replyTo = replyTo;
		this.sessionId = sessionId;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
        payload.put(Constants.USER_ID, userId);
        payload.put(Constants.AUTH_TOKEN, token);		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(VALIDATE_AUTH_TOKEN, VERSION, replyTo);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static ValidateAuthTokenMessage fromJson(String message) {
		System.out.println("Process ValidateAuthTokenMessage.fromJson");
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			System.out.println("Process ValidateAuthTokenMessage.fromJson 1");
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				System.out.println("Process ValidateAuthTokenMessage.fromJson 2");
				String messageName = header.get("name").getAsString();
				if (VALIDATE_AUTH_TOKEN.equals(messageName)) {
					System.out.println("Process ValidateAuthTokenMessage.fromJson 3");
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.AUTH_TOKEN)
							&& header.has(Constants.REPLY_TO)) {
						System.out.println("Process ValidateAuthTokenMessage.fromJson 4");
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						String authToken = payload.get(Constants.AUTH_TOKEN).getAsString();
						String replyTo = header.get(Constants.REPLY_TO).getAsString();
						String sessionId = "tobeimplemented";
						return new ValidateAuthTokenMessage(id, userid, authToken, replyTo,
						    sessionId);					
					}
				} 
			}
		}
		System.out.println("Process ValidateAuthTokenMessage.fromJson 0000");
		return null;

	}
}
