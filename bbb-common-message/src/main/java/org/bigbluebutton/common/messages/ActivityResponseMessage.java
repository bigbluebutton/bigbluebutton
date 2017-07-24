package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class ActivityResponseMessage implements IBigBlueButtonMessage {
	public static final String ACTIVITY_RESPONSE = "activity_response_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;

	public ActivityResponseMessage(String meetingId) {
		this.meetingId = meetingId;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(ACTIVITY_RESPONSE, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static ActivityResponseMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (ACTIVITY_RESPONSE.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();

						return new ActivityResponseMessage(meetingId);
					}
				}
			}
		}

		return null;
	}
}