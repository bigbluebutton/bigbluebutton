package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class PresentationConversionErrorMessage implements ISubscribedMessage {
	public static final String PRESENTATION_CONVERSION_ERROR = "presentation_conversion_error_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final String presentationId;
	public final String code;
	public final String messageKey;
	public final String presentationName;
	public final int numPages;
	public final int maxNumPages;
	

	
	
	public PresentationConversionErrorMessage(String meetingId, String presentationId,
			String code, String messageKey, String presentationName,
			int numPages, int maxNumPages) {
		this.meetingId = meetingId;
		this.presentationId = presentationId;
		this.code = code;
		this.messageKey = messageKey;
		this.presentationName = presentationName;
		this.maxNumPages = maxNumPages;
		this.numPages = numPages;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.PRESENTATION_ID, presentationId);
		payload.put(Constants.CODE, code);
		payload.put(Constants.MESSAGE_KEY, messageKey);
		payload.put(Constants.PRESENTATION_NAME, presentationName);
		payload.put(Constants.NUM_PAGES, numPages);
		payload.put(Constants.MAX_NUM_PAGES, maxNumPages);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(PRESENTATION_CONVERSION_ERROR, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static PresentationConversionErrorMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (PRESENTATION_CONVERSION_ERROR.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
						&& payload.has(Constants.CODE)
						&& payload.has(Constants.MESSAGE_KEY)
						&& payload.has(Constants.MAX_NUM_PAGES)
						&& payload.has(Constants.NUM_PAGES)
						&& payload.has(Constants.PRESENTATION_NAME)
						&& payload.has(Constants.PRESENTATION_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String presentationId = payload.get(Constants.PRESENTATION_ID).getAsString();
						String presentationName = payload.get(Constants.PRESENTATION_NAME).getAsString();
						String code = payload.get(Constants.CODE).getAsString();
						String messageKey = payload.get(Constants.MESSAGE_KEY).getAsString();
						int numPages = payload.get(Constants.NUM_PAGES).getAsInt();
						int maxNumPages = payload.get(Constants.MAX_NUM_PAGES).getAsInt();

						return new PresentationConversionErrorMessage(meetingId, presentationId,
								code, messageKey, presentationName, numPages, maxNumPages);
					}
				}
			}
		}
		return null;
	}
}
