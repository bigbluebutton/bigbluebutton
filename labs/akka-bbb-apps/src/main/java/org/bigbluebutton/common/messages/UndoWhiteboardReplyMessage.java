package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class UndoWhiteboardReplyMessage implements ISubscribedMessage {

	// the name of this event should be undo_whiteboard_reply (as it corresponds
	// to undo_whiteboard_request which entered bbb-apps)
	// However, on the clients we use undo_whiteboard_request for both request and reply
	// 
	// The only difference is shapeId here. Plus this message is on channel FROM_WHITEBOARD_CHANNEL
	public static final String UNDO_WHITEBOARD_REPLY = "undo_whiteboard_request";//see note above
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String whiteboardId;
	public final String requesterId;
	public final String shapeId;


	public UndoWhiteboardReplyMessage(String meetingId, String requesterId, String whiteboardId, String shapeId) {
		this.meetingId = meetingId;
		this.whiteboardId = whiteboardId;
		this.requesterId = requesterId;
		this.shapeId = shapeId;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.WHITEBOARD_ID, whiteboardId);
		payload.put(Constants.REQUESTER_ID, requesterId);
		payload.put(Constants.SHAPE_ID, shapeId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(UNDO_WHITEBOARD_REPLY, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static UndoWhiteboardReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (UNDO_WHITEBOARD_REPLY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.WHITEBOARD_ID)
							&& payload.has(Constants.SHAPE_ID)
							&& payload.has(Constants.REQUESTER_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String whiteboardId = payload.get(Constants.WHITEBOARD_ID).getAsString();
						String shapeId = payload.get(Constants.SHAPE_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();

						return new UndoWhiteboardReplyMessage(meetingId, requesterId, whiteboardId, shapeId);
					}
				}
			}
		}
		return null;
	}
}
