package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class ResizeAndMoveSlideMessage implements IBigBlueButtonMessage {
	public static final String RESIZE_AND_MOVE_SLIDE = "resize_and_move_slide";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final double xOffset;
	public final double yOffset;
	public final double widthRatio;
	public final double heightRatio;

	public ResizeAndMoveSlideMessage(String meetingId, double xOffset, double yOffset,
			double widthRatio, double heightRatio) {
		this.meetingId = meetingId;
		this.xOffset = xOffset;
		this.yOffset = yOffset;
		this.heightRatio = heightRatio;
		this.widthRatio = widthRatio;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.X_OFFSET, xOffset);
		payload.put(Constants.Y_OFFSET, yOffset);
		payload.put(Constants.HEIGHT_RATIO, heightRatio);
		payload.put(Constants.WIDTH_RATIO, widthRatio);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(RESIZE_AND_MOVE_SLIDE, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static ResizeAndMoveSlideMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (RESIZE_AND_MOVE_SLIDE.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.X_OFFSET)
							&& payload.has(Constants.Y_OFFSET)
							&& payload.has(Constants.HEIGHT_RATIO)
							&& payload.has(Constants.WIDTH_RATIO)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						double xOffset = payload.get(Constants.X_OFFSET).getAsDouble();
						double yOffset = payload.get(Constants.Y_OFFSET).getAsDouble();
						double heightRatio = payload.get(Constants.HEIGHT_RATIO).getAsDouble();
						double widthRatio = payload.get(Constants.WIDTH_RATIO).getAsDouble();

						return new ResizeAndMoveSlideMessage(meetingId, xOffset, yOffset, widthRatio, heightRatio);
					}
				} 
			}
		}
		return null;
	}
}
