package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class MeetingEndedMessage implements ISubscribedMessage {
	public static final String MEETING_ENDED = "meeting_ended_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;

	public MeetingEndedMessage(String meetingID) {
		this.meetingId = meetingID;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(MEETING_ENDED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	public static MeetingEndedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (MEETING_ENDED.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();

						return new 	MeetingEndedMessage(meetingId);					
					}
				}
			}
		}

		return null;
	}
}
