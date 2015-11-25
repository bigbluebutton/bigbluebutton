package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class GuestAccessDeniedMessage implements IBigBlueButtonMessage {
	public static final String GUEST_ACCESS_DENIED = "guest_access_denied";
	public static final String VERSION = "0.0.1";

	public final String meetingID;
	public final String userId;

	public GuestAccessDeniedMessage(String meetingID, String userId) {
		this.meetingID = meetingID;
		this.userId = userId;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingID);
		payload.put(Constants.USER_ID, userId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(GUEST_ACCESS_DENIED, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static GuestAccessDeniedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (GUEST_ACCESS_DENIED.equals(messageName)) {

					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String userId = payload.get(Constants.USER_ID).getAsString();

						return new GuestAccessDeniedMessage(meetingID, userId);
					}
				} 
			}
		}
		return null;
	}
}
