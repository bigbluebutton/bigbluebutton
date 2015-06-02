package org.bigbluebutton.common.messages;

import java.util.HashMap;
import java.util.Map;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class SendWhiteboardAnnotationRequestMessage implements ISubscribedMessage {
	public static final String SEND_WHITEBOARD_ANNOTATION_REQUEST = "send_whiteboard_annotation_request";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;
	public final Map<String, Object> annotation;


	public SendWhiteboardAnnotationRequestMessage(String meetingId,
			String requesterId, Map<String, Object> annotation) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.annotation = annotation;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.REQUESTER_ID, requesterId);
		payload.put(Constants.ANNOTATION, annotation);
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(SEND_WHITEBOARD_ANNOTATION_REQUEST, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static SendWhiteboardAnnotationRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (SEND_WHITEBOARD_ANNOTATION_REQUEST.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.ANNOTATION)
							&& payload.has(Constants.REQUESTER_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();

						JsonObject annotationElement = (JsonObject) payload.get(Constants.ANNOTATION);

						Util util = new Util();
						Map<String, Object> annotation = util.extractAnnotation(annotationElement);

						return new SendWhiteboardAnnotationRequestMessage(meetingId, requesterId, annotation);
					}
				}
			}
		}
		return null;
	}
}
