package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class MeetingIsActiveMessage implements IBigBlueButtonMessage {
	public static final String MEETING_IS_ACTIVE = "meeting_is_active_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;

	public MeetingIsActiveMessage(String meetingId) {
		this.meetingId = meetingId;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(MEETING_IS_ACTIVE, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static MeetingIsActiveMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (MEETING_IS_ACTIVE.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();

						return new MeetingIsActiveMessage(meetingId);
					}
				}
			}
		}
		return null;
	}
}