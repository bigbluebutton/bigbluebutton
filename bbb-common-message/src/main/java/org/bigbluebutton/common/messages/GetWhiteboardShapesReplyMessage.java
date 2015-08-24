package org.bigbluebutton.common.messages;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class GetWhiteboardShapesReplyMessage implements ISubscribedMessage {
	public static final String GET_WHITEBOARD_SHAPES_REPLY = "get_whiteboard_shapes_reply";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;
	public final String whiteboardId;
	public final ArrayList<Map<String, Object>> shapes;


	public GetWhiteboardShapesReplyMessage(String meetingId, String requesterId,
			String whiteboardId, ArrayList<Map<String, Object>> shapes) {
		this.meetingId = meetingId;
		this.whiteboardId = whiteboardId;
		this.requesterId = requesterId;
		this.shapes = shapes;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.SHAPES, shapes);
		payload.put(Constants.WHITEBOARD_ID, whiteboardId);
		payload.put(Constants.REQUESTER_ID, requesterId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(GET_WHITEBOARD_SHAPES_REPLY, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static GetWhiteboardShapesReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (GET_WHITEBOARD_SHAPES_REPLY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.WHITEBOARD_ID)
							&& payload.has(Constants.SHAPES)
							&& payload.has(Constants.REQUESTER_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();
						String whiteboardId = payload.get(Constants.WHITEBOARD_ID).getAsString();

						JsonArray shapes = (JsonArray) payload.get(Constants.SHAPES);

						Util util = new Util();

						ArrayList<Map<String, Object>> shapesList = util.extractShapes(shapes);
						return new GetWhiteboardShapesReplyMessage(meetingId, requesterId,
								whiteboardId, shapesList);
					}
				} 
			}
		}
		return null;
	}
}
