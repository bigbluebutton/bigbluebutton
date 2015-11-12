package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class DisconnectUserMessage implements IBigBlueButtonMessage {
	public static final String DISCONNECT_USER = "disconnect_user_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final String userId;

	public DisconnectUserMessage(String meetingID, String userId) {
		this.meetingId = meetingID;
		this.userId = userId;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(DISCONNECT_USER, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	public static DisconnectUserMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (DISCONNECT_USER.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.USER_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String userId = payload.get(Constants.USER_ID).getAsString();

						return new 	DisconnectUserMessage(meetingId, userId);					
					}
				}
			}
		}

		return null;
	}
}
