package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class PatchDocumentReplyMessage implements ISubscribedMessage {
	public static final String PATCH_DOCUMENT_REPLY = "patch_document_reply";
	public final String VERSION = "0.0.1";

	public final String meetingID;
	public final String requesterID;
	public final String noteID;
	public final String patch;
	public final Integer patchID;
	public final Boolean undo;
	public final Boolean redo;

	public PatchDocumentReplyMessage(String meetingID, String requesterID, String noteID, String patch, Integer patchID, Boolean undo, Boolean redo) {
		this.meetingID = meetingID;
		this.requesterID = requesterID;
		this.noteID = noteID;
		this.patch = patch;
		this.patchID = patchID;
		this.undo = undo;
		this.redo = redo;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingID);
		payload.put(Constants.REQUESTER_ID, requesterID);
		payload.put(Constants.NOTE_ID, noteID);
		payload.put(Constants.PATCH, patch);
		payload.put(Constants.PATCH_ID, patchID);
		payload.put(Constants.UNDO, undo);
		payload.put(Constants.REDO, redo);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(PATCH_DOCUMENT_REPLY, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static PatchDocumentReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (PATCH_DOCUMENT_REPLY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.REQUESTER_ID)
							&& payload.has(Constants.NOTE_ID)
							&& payload.has(Constants.PATCH)
							&& payload.has(Constants.PATCH_ID)
							&& payload.has(Constants.UNDO)
							&& payload.has(Constants.REDO)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String requesterID = payload.get(Constants.REQUESTER_ID).getAsString();
						String noteID = payload.get(Constants.NOTE_ID).getAsString();
						String patch = payload.get(Constants.PATCH).getAsString();
						Integer patchID = payload.get(Constants.PATCH_ID).getAsInt();
						Boolean undo = payload.get(Constants.UNDO).getAsBoolean();
						Boolean redo = payload.get(Constants.REDO).getAsBoolean();

						return new PatchDocumentReplyMessage(meetingID, requesterID, noteID, patch, patchID, undo, redo);
					}
				}
			}
		}
		return null;
	}
}