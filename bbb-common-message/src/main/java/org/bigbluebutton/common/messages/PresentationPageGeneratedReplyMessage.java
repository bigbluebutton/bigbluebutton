package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class PresentationPageGeneratedReplyMessage implements ISubscribedMessage {
	public static final String PRESENTATION_PAGE_GENERATED = "presentation_page_generated_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final String presentationId;
	public final int numPages;
	public final String code;
	public final String messageKey;
	public final String presentationName;
	public final int pagesCompleted;

	public PresentationPageGeneratedReplyMessage(String meetingId, String presentationId,
			int numPages, String code, String messageKey, String presentationName,
			int pagesCompleted) {
		this.meetingId = meetingId;
		this.presentationId = presentationId;
		this.code = code;
		this.messageKey = messageKey;
		this.presentationName = presentationName;
		this.pagesCompleted = pagesCompleted;
		this.numPages = numPages;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.PRESENTATION_ID, presentationId);
		payload.put(Constants.CODE, code);
		payload.put(Constants.MESSAGE_KEY, messageKey);
		payload.put(Constants.PRESENTATION_NAME, presentationName);
		payload.put(Constants.PAGES_COMPLETED, pagesCompleted);
		payload.put(Constants.NUM_PAGES, numPages);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(PRESENTATION_PAGE_GENERATED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static PresentationPageGeneratedReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (PRESENTATION_PAGE_GENERATED.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.CODE)
							&& payload.has(Constants.MESSAGE_KEY)
							&& payload.has(Constants.PRESENTATION_NAME)
							&& payload.has(Constants.NUM_PAGES)
						&& payload.has(Constants.PAGES_COMPLETED)
						&& payload.has(Constants.PRESENTATION_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String presentationId = payload.get(Constants.PRESENTATION_ID).getAsString();
						String presentationName = payload.get(Constants.PRESENTATION_NAME).getAsString();
						String code = payload.get(Constants.CODE).getAsString();
						String messageKey = payload.get(Constants.MESSAGE_KEY).getAsString();
						int numPages = payload.get(Constants.NUM_PAGES).getAsInt();
						int pagesCompleted = payload.get(Constants.PAGES_COMPLETED).getAsInt();

						return new PresentationPageGeneratedReplyMessage(meetingId, presentationId,
								numPages, code, messageKey, presentationName, pagesCompleted);
					}
				}
			}
		}
		return null;
	}
}




