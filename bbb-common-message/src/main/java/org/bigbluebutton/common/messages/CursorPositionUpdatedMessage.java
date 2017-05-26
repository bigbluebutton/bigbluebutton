package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class CursorPositionUpdatedMessage implements ISubscribedMessage {
	public static final String CURSOR_POSITION_UPDATED = "cursor_position_updated_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;
	public final double xPercent;
	public final double yPercent;

	public CursorPositionUpdatedMessage(String meetingId, String requesterId, double xPercent, double yPercent) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.xPercent = xPercent;
		this.yPercent = yPercent;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.REQUESTER_ID, requesterId);
		payload.put(Constants.X_PERCENT, xPercent);
		payload.put(Constants.Y_PERCENT, yPercent);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(CURSOR_POSITION_UPDATED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static CursorPositionUpdatedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (CURSOR_POSITION_UPDATED.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.REQUESTER_ID)
							&& payload.has(Constants.X_PERCENT)
						&& payload.has(Constants.Y_PERCENT)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();
						double xPercent = payload.get(Constants.X_PERCENT).getAsDouble();
						double yPercent = payload.get(Constants.Y_PERCENT).getAsDouble();

						return new CursorPositionUpdatedMessage(meetingId, requesterId, xPercent, yPercent);
					}
				}
			}
		}
		return null;
	}
}





