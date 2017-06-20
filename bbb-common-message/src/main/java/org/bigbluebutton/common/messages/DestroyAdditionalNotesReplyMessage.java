package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class DestroyAdditionalNotesReplyMessage implements ISubscribedMessage {
	public static final String DESTROY_ADDITIONAL_NOTES_REPLY = "destroy_additional_notes_reply";
	public final String VERSION = "0.0.1";

	public final String meetingID;
	public final String noteID;

	public DestroyAdditionalNotesReplyMessage(String meetingID, String noteID) {
		this.meetingID = meetingID;
		this.noteID = noteID;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingID);
		payload.put(Constants.NOTE_ID, noteID);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(DESTROY_ADDITIONAL_NOTES_REPLY, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static DestroyAdditionalNotesReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (DESTROY_ADDITIONAL_NOTES_REPLY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.NOTE_ID)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String noteID = payload.get(Constants.NOTE_ID).getAsString();

						return new DestroyAdditionalNotesReplyMessage(meetingID, noteID);
					}
				}
			}
		}
		return null;
	}
}