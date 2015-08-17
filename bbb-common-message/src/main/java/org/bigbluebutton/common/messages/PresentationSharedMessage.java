package org.bigbluebutton.common.messages;

import java.util.HashMap;
import java.util.Map;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class PresentationSharedMessage implements ISubscribedMessage {
	public static final String PRESENTATION_SHARED_MESSAGE = "presentation_shared_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final Map<String,Object> presentation;

	public PresentationSharedMessage(String meetingId, Map<String,Object> presentation) {
		this.meetingId = meetingId;
		this.presentation = presentation;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.PRESENTATION, presentation);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(PRESENTATION_SHARED_MESSAGE, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static PresentationSharedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (PRESENTATION_SHARED_MESSAGE.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
						&& payload.has(Constants.PRESENTATION)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();

						JsonObject presentationObject = (JsonObject) payload.get(Constants.PRESENTATION).getAsJsonObject();
						Util util = new Util();

						Map<String, Object> presentation = util.extractPresentation(presentationObject);

						return new PresentationSharedMessage(meetingId, presentation);
					}
				}
			}
		}
		return null;
	}
}

