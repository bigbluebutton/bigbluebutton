package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class UserRoleChangeMessage implements IBigBlueButtonMessage {
	public static final String USER_ROLE_CHANGE = "user_role_change";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String userId;
	public final String role;

	public UserRoleChangeMessage(String meetingId, String userId, String role) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.role = role;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.USER_ID, userId);
		payload.put(Constants.ROLE, role);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_ROLE_CHANGE, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static UserRoleChangeMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (USER_ROLE_CHANGE.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.ROLE)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String userId = payload.get(Constants.USER_ID).getAsString();
						String role = payload.get(Constants.ROLE).getAsString();

						return new UserRoleChangeMessage(meetingId, userId, role);
					}
				} 
			}
		}
		return null;
	}
}
