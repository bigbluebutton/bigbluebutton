package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class SendConversionCompletedMessage implements IBigBlueButtonMessage {
	public static final String SEND_CONVERSION_COMPLETED = "send_conversion_completed";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String messageKey;
	public final String code;
	public final String presId;
	public final int numPages;
	public final String presName;
	public final String presBaseUrl;

	public SendConversionCompletedMessage(String messageKey, String meetingId,	String code,
			String presId, int numPages, String presName,	String presBaseUrl) {
		this.meetingId = meetingId;
		this.messageKey = messageKey;
		this.code = code;
		this.presId = presId;
		this.numPages = numPages;
		this.presName = presName;
		this.presBaseUrl = presBaseUrl;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.MESSAGE_KEY, messageKey);
		payload.put(Constants.CODE, code);
		payload.put(Constants.PRESENTATION_ID, presId);
		payload.put(Constants.NUM_PAGES, numPages);
		payload.put(Constants.PRESENTATION_NAME, presName);
		payload.put(Constants.PRESENTATION_BASE_URL, presBaseUrl);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(SEND_CONVERSION_COMPLETED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static SendConversionCompletedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (SEND_CONVERSION_COMPLETED.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.MESSAGE_KEY)
							&& payload.has(Constants.CODE)
							&& payload.has(Constants.PRESENTATION_ID)
							&& payload.has(Constants.NUM_PAGES)
							&& payload.has(Constants.PRESENTATION_NAME)
							&& payload.has(Constants.PRESENTATION_BASE_URL)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String messageKey = payload.get(Constants.MESSAGE_KEY).getAsString();
						String code = payload.get(Constants.CODE).getAsString();
						String presId = payload.get(Constants.PRESENTATION_ID).getAsString();
						int numPages = payload.get(Constants.NUM_PAGES).getAsInt();
						String presName = payload.get(Constants.PRESENTATION_NAME).getAsString();
						String presBaseUrl = payload.get(Constants.PRESENTATION_BASE_URL).getAsString();

						return new SendConversionCompletedMessage(messageKey, meetingId, code, presId, numPages, presName, presBaseUrl);
					}
				} 
			}
		}
		return null;
	}
}
