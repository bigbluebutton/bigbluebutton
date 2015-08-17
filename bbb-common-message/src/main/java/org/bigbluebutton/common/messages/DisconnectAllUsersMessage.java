package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class DisconnectAllUsersMessage implements IBigBlueButtonMessage {
	public static final String DISCONNECT_All_USERS = "disconnect_all_users_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;

	public DisconnectAllUsersMessage(String meetingID) {
		this.meetingId = meetingID;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(DISCONNECT_All_USERS, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	public static DisconnectAllUsersMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (DISCONNECT_All_USERS.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();

						return new 	DisconnectAllUsersMessage(meetingId);					
					}
				}
			}
		}

		return null;
	}
}
