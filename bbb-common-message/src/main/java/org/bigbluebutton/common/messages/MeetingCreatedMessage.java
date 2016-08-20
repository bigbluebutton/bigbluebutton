package org.bigbluebutton.common.messages;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.util.HashMap;

public class MeetingCreatedMessage implements ISubscribedMessage {
	public static final String MEETING_CREATED = "meeting_created_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final Boolean record;

	public MeetingCreatedMessage(String meetingId, Boolean record) {
		this.meetingId = meetingId;
		this.record = record;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);

		HashMap<String, Object> header = MessageBuilder.buildHeader(MEETING_CREATED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static MeetingCreatedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (MEETING_CREATED.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) && payload.has(Constants.RECORDED)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						Boolean record = payload.get(Constants.RECORDED).getAsBoolean();
						return new MeetingCreatedMessage(meetingId, record);
					}
				}
			}
		}

		return null;
	}
}
