package org.bigbluebutton.common.messages;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class CreateAdditionalNotesRequestMessage implements ISubscribedMessage {
	public static final String CREATE_ADDITIONAL_NOTES_REQUEST = "create_additional_notes_request";
	public final String VERSION = "0.0.1";

	public final String meetingID;
	public final String requesterID;
	public final String noteName;

	public CreateAdditionalNotesRequestMessage(String meetingID, String requesterID, String noteName) {
		this.meetingID = meetingID;
		this.requesterID = requesterID;
		this.noteName = noteName;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingID);
		payload.put(Constants.REQUESTER_ID, requesterID);
		payload.put(Constants.NOTE_NAME, noteName);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(CREATE_ADDITIONAL_NOTES_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static CreateAdditionalNotesRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (CREATE_ADDITIONAL_NOTES_REQUEST.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.REQUESTER_ID)
							&& payload.has(Constants.NOTE_NAME)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String requesterID = payload.get(Constants.REQUESTER_ID).getAsString();
						String noteName = payload.get(Constants.NOTE_NAME).getAsString();

						return new CreateAdditionalNotesRequestMessage(meetingID, requesterID, noteName);
					}
				}
			}
		}
		return null;
	}
}