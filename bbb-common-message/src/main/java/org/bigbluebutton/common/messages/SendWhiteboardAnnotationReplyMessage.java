package org.bigbluebutton.common.messages;

import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class SendWhiteboardAnnotationReplyMessage implements ISubscribedMessage {
	public static final String SEND_WHITEBOARD_ANNOTATION_REPLY = "send_whiteboard_shape_message";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;
	public final String whiteboardId;
	public final Map<String, Object> shape;


	public SendWhiteboardAnnotationReplyMessage(String meetingId, String requesterId,
			String whiteboardId, Map<String, Object> shape) {
		this.meetingId = meetingId;
		this.whiteboardId = whiteboardId;
		this.requesterId = requesterId;
		this.shape = shape;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.SHAPE, shape);
		payload.put(Constants.WHITEBOARD_ID, whiteboardId);
		payload.put(Constants.REQUESTER_ID, requesterId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(SEND_WHITEBOARD_ANNOTATION_REPLY, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static SendWhiteboardAnnotationReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (SEND_WHITEBOARD_ANNOTATION_REPLY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.WHITEBOARD_ID)
							&& payload.has(Constants.SHAPE)
							&& payload.has(Constants.REQUESTER_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();
						String whiteboardId = payload.get(Constants.WHITEBOARD_ID).getAsString();

						JsonObject shape = (JsonObject) payload.get(Constants.SHAPE);

						Util util = new Util();
						Map<String, Object> annotation = util.extractOuterAnnotation(shape);

						return new SendWhiteboardAnnotationReplyMessage(meetingId, requesterId,
								whiteboardId, annotation);
					}
				} 
			}
		}
		return null;
	}
}
