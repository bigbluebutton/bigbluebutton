package org.bigbluebutton.conference.service.messaging;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class RegisterUserMessage implements IMessage {
	public static final String REGISTER_USER = "register_user_request";
	public final String VERSION = "0.0.1";

	public final String meetingID;
	public final String internalUserId;
	public final String fullname;
	public final String role;
	public final String externUserID;
	public final String authToken;

	public RegisterUserMessage(String meetingID, String internalUserId, String fullname, String role, String externUserID, String authToken) {
		this.meetingID = meetingID;
		this.internalUserId = internalUserId;
		this.fullname = fullname;
		this.role = role;
		this.externUserID = externUserID;
		this.authToken = authToken;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();

		payload.put(Constants.MEETING_ID, meetingID);
		payload.put(Constants.INTERNAL_USER_ID, internalUserId);
		payload.put(Constants.NAME, fullname);
		payload.put(Constants.ROLE, role);
		payload.put(Constants.EXT_USER_ID, externUserID);
		payload.put(Constants.AUTH_TOKEN, authToken);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(REGISTER_USER, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	public static RegisterUserMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (REGISTER_USER.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.NAME)
							&& payload.has(Constants.ROLE)
							&& payload.has(Constants.EXT_USER_ID)
							&& payload.has(Constants.AUTH_TOKEN)) {

						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String fullname = payload.get(Constants.NAME).getAsString();
						String role = payload.get(Constants.ROLE).getAsString();
						String externUserID = payload.get(Constants.EXT_USER_ID).getAsString();
						String authToken = payload.get(Constants.AUTH_TOKEN).getAsString();

						//use externalUserId twice - once for external, once for internal
						return new RegisterUserMessage(meetingID, externUserID, fullname, role, externUserID, authToken);
					}
				}
			}
		}
		System.out.println("Failed to parse RegisterUserMessage");
		return null;
	}
}
