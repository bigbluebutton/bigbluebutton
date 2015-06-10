package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class EnableWhiteboardRequestMessage implements ISubscribedMessage {
	public static final String ENABLE_WHITEBOARD_REQUEST = "enable_whiteboard_request";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;
	public final boolean enable;

	public EnableWhiteboardRequestMessage(String meetingId,
			String requesterId, boolean enable) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.enable = enable;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.REQUESTER_ID, requesterId);
		payload.put(Constants.ENABLE, enable);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(ENABLE_WHITEBOARD_REQUEST, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static EnableWhiteboardRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (ENABLE_WHITEBOARD_REQUEST.equals(messageName)) {

					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.ENABLE)
							&& payload.has(Constants.REQUESTER_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();
						boolean enable = payload.get(Constants.ENABLE).getAsBoolean();

						return new EnableWhiteboardRequestMessage(meetingId, requesterId, enable);
					}
				}
			}
		}
		return null;
	}
}
