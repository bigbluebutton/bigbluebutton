package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class SendCursorUpdateMessage implements IBigBlueButtonMessage {
	public static final String SEND_CURSOR_UPDATE = "send_cursor_update";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final double xPercent;
	public final double yPercent;

	public SendCursorUpdateMessage(String meetingId, double xPercent, double yPercent){
		this.meetingId = meetingId;
		this.xPercent = xPercent;
		this.yPercent = yPercent;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.X_PERCENT, xPercent);
		payload.put(Constants.Y_PERCENT, yPercent);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(SEND_CURSOR_UPDATE, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static SendCursorUpdateMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (SEND_CURSOR_UPDATE.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.X_PERCENT)
							&& payload.has(Constants.Y_PERCENT)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						double xPercent = payload.get(Constants.X_PERCENT).getAsDouble();
						double yPercent = payload.get(Constants.Y_PERCENT).getAsDouble();

						return new SendCursorUpdateMessage(meetingId, xPercent, yPercent);
					}
				}
			}
		}
		return null;
	}
}
