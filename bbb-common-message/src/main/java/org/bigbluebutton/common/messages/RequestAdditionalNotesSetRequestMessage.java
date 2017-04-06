package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class RequestAdditionalNotesSetRequestMessage implements ISubscribedMessage {
	public static final String REQUEST_ADDITIONAL_NOTES_SET_REQUEST = "request_additional_notes_set_request";
	public final String VERSION = "0.0.1";

	public final String meetingID;
	public final String requesterID;
	public final int additionalNotesSetSize;

	public RequestAdditionalNotesSetRequestMessage(String meetingID, String requesterID, int additionalNotesSetSize) {
		this.meetingID = meetingID;
		this.requesterID = requesterID;
		this.additionalNotesSetSize = additionalNotesSetSize;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingID);
		payload.put(Constants.REQUESTER_ID, requesterID);
		payload.put(Constants.ADDITIONAL_NOTES_SET_SIZE, additionalNotesSetSize);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(REQUEST_ADDITIONAL_NOTES_SET_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static RequestAdditionalNotesSetRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (REQUEST_ADDITIONAL_NOTES_SET_REQUEST.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.REQUESTER_ID)
							&& payload.has(Constants.ADDITIONAL_NOTES_SET_SIZE)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String requesterID = payload.get(Constants.REQUESTER_ID).getAsString();
						int additionalNotesSetSize = payload.get(Constants.ADDITIONAL_NOTES_SET_SIZE).getAsInt();

						return new RequestAdditionalNotesSetRequestMessage(meetingID, requesterID, additionalNotesSetSize);
					}
				}
			}
		}
		return null;
	}
}
