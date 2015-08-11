package org.bigbluebutton.common.messages;

import java.util.HashMap;
import java.util.Map;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class PresentationPageResizedMessage implements ISubscribedMessage {
	public static final String PRESENTATION_PAGE_RESIZED = "presentation_page_resized_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final Map<String,Object> page;

	public PresentationPageResizedMessage(String meetingId, Map<String,Object> page) {
		this.meetingId = meetingId;
		this.page = page;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.PAGE, page);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(PRESENTATION_PAGE_RESIZED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static PresentationPageResizedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (PRESENTATION_PAGE_RESIZED.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
						&& payload.has(Constants.PAGE)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();

						JsonObject pageObject = (JsonObject) payload.get(Constants.PAGE).getAsJsonObject();
						Map<String, Object> page = new HashMap<String, Object>();
						Util util = new Util();
						page = util.extractPage(pageObject);

						return new PresentationPageResizedMessage(meetingId, page);
					}
				}
			}
		}
		return null;
	}
}

