package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class SharePresentationMessage implements IBigBlueButtonMessage {
	public static final String SHARE_PRESENTATION = "share_presentation";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String presentationId;
	public final boolean share;

	public SharePresentationMessage(String meetingId, String presentationId,
			boolean share){
		this.meetingId = meetingId;
		this.presentationId = presentationId;
		this.share = share;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.PRESENTATION_ID, presentationId);
		payload.put(Constants.SHARE, share);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(SHARE_PRESENTATION, VERSION, null);
		
		return MessageBuilder.buildJson(header, payload);
	}

	public static SharePresentationMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (SHARE_PRESENTATION.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.PRESENTATION_ID)
							&& payload.has(Constants.SHARE)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String presentationId = payload.get(Constants.PRESENTATION_ID).getAsString();
						boolean share = payload.get(Constants.SHARE).getAsBoolean();

						return new SharePresentationMessage(meetingId, presentationId, share);
					}
				}
			}
		}
		return null;
	}
}
