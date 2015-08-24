package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class PresentationRemovedMessage implements ISubscribedMessage {
	public static final String PRESENTATION_REMOVED = "presentation_removed_message";
	public final String VERSION = "0.0.1";

	public static final String PRESENTATION_ID = "presentation_id";
	public static final String MEETING_ID = "meeting_id";
	
	public final String meetingId;
	public final String presentationId;
	
	public PresentationRemovedMessage(String meetingId, String presentationId) {
		this.meetingId = meetingId;
		this.presentationId = presentationId;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId);
		payload.put(PRESENTATION_ID, presentationId);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(PRESENTATION_REMOVED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static PresentationRemovedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (PRESENTATION_REMOVED.equals(messageName)) {
					if (payload.has(MEETING_ID)
						&& payload.has(PRESENTATION_ID)) {
						String meetingId = payload.get(MEETING_ID).getAsString();
						String presentationId = payload.get(PRESENTATION_ID).getAsString();
						return new 	PresentationRemovedMessage(meetingId, presentationId);					
					}
				}
			}
		}

		return null;
	}
}
