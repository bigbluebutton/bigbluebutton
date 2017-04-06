package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class ClearWhiteboardReplyMessage implements ISubscribedMessage {

	public static final String WHITEBOARD_CLEARED_MESSAGE = "whiteboard_cleared_message";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String whiteboardId;
	public final String requesterId;
	public final Boolean fullClear;


	public ClearWhiteboardReplyMessage(String meetingId, String requesterId, String whiteboardId, Boolean fullClear) {
		this.meetingId = meetingId;
		this.whiteboardId = whiteboardId;
		this.requesterId = requesterId;
		this.fullClear = fullClear;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.WHITEBOARD_ID, whiteboardId);
		payload.put(Constants.REQUESTER_ID, requesterId);
		payload.put(Constants.FULL_CLEAR, fullClear);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(WHITEBOARD_CLEARED_MESSAGE, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static ClearWhiteboardReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (WHITEBOARD_CLEARED_MESSAGE.equals(messageName)) {

					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.WHITEBOARD_ID)
							&& payload.has(Constants.REQUESTER_ID)
							&& payload.has(Constants.FULL_CLEAR)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String whiteboardId = payload.get(Constants.WHITEBOARD_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();
						Boolean fullClear = payload.get(Constants.FULL_CLEAR).getAsBoolean();

						return new ClearWhiteboardReplyMessage(meetingId, requesterId, whiteboardId, fullClear);
					}
				}
			}
		}
		return null;
	}
}
