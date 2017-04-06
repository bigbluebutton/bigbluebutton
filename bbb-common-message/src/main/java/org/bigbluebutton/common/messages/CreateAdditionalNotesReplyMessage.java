package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class CreateAdditionalNotesReplyMessage implements ISubscribedMessage {
	public static final String CREATE_ADDITIONAL_NOTES_REPLY = "create_additional_notes_reply";
	public final String VERSION = "0.0.1";

	public final String meetingID;
	public final String noteID;
	public final String noteName;

	public CreateAdditionalNotesReplyMessage(String meetingID, String noteID, String noteName) {
		this.meetingID = meetingID;
		this.noteID = noteID;
		this.noteName = noteName;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingID);
		payload.put(Constants.NOTE_ID, noteID);
		payload.put(Constants.NOTE_NAME, noteName);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(CREATE_ADDITIONAL_NOTES_REPLY, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static CreateAdditionalNotesReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (CREATE_ADDITIONAL_NOTES_REPLY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.NOTE_ID)
							&& payload.has(Constants.NOTE_NAME)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String noteID = payload.get(Constants.NOTE_ID).getAsString();
						String noteName = payload.get(Constants.NOTE_NAME).getAsString();

						return new CreateAdditionalNotesReplyMessage(meetingID, noteID, noteName);
					}
				}
			}
		}
		return null;
	}
}