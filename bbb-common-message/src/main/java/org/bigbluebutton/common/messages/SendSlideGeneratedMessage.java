package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class SendSlideGeneratedMessage implements IBigBlueButtonMessage {
	public static final String SEND_SLIDE_GENERATED = "send_slide_generated";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String messageKey;
	public final String code;
	public final String presId;
	public final int numberOfPages;
	public final int pagesCompleted;
	public final String presName;

	public SendSlideGeneratedMessage(String messageKey, String meetingId,
			String code, String presId, int numberOfPages, int pagesCompleted,
			String presName) {
		this.meetingId = meetingId;
		this.messageKey = messageKey;
		this.code = code;
		this.presId = presId;
		this.numberOfPages = numberOfPages;
		this.pagesCompleted = pagesCompleted;
		this.presName = presName;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.MESSAGE_KEY, messageKey);
		payload.put(Constants.CODE, code);
		payload.put(Constants.PRESENTATION_ID, presId);
		payload.put(Constants.NUM_PAGES, numberOfPages);
		payload.put(Constants.PAGES_COMPLETED, pagesCompleted);
		payload.put(Constants.PRESENTATION_NAME, presName);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(SEND_SLIDE_GENERATED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static SendSlideGeneratedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (SEND_SLIDE_GENERATED.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.MESSAGE_KEY)
							&& payload.has(Constants.CODE)
							&& payload.has(Constants.PRESENTATION_ID)
							&& payload.has(Constants.PAGES_COMPLETED)
							&& payload.has(Constants.NUM_PAGES)
							&& payload.has(Constants.PRESENTATION_NAME)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String messageKey = payload.get(Constants.MESSAGE_KEY).getAsString();
						String code = payload.get(Constants.CODE).getAsString();
						String presId = payload.get(Constants.PRESENTATION_ID).getAsString();
						int numberOfPages = payload.get(Constants.NUM_PAGES).getAsInt();
						int pagesCompleted = payload.get(Constants.PAGES_COMPLETED).getAsInt();
						String presName = payload.get(Constants.PRESENTATION_NAME).getAsString();

						return new SendSlideGeneratedMessage(messageKey, meetingId, code, presId, numberOfPages, pagesCompleted, presName);
					}
				}
			}
		}
		return null;
	}
}
