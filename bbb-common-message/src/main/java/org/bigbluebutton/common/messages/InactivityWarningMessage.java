package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class InactivityWarningMessage implements IBigBlueButtonMessage {
	public static final String INACTIVITY_WARNING = "inactivity_warning_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final Long duration;

	public InactivityWarningMessage(String meetingId, Long duration) {
		this.meetingId = meetingId;
		this.duration = duration;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.DURATION, duration);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(INACTIVITY_WARNING, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static InactivityWarningMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (INACTIVITY_WARNING.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.DURATION)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						Long duration = payload.get(Constants.DURATION).getAsLong();

						return new InactivityWarningMessage(meetingId, duration);
					}
				}
			}
		}
		return null;
	}
}