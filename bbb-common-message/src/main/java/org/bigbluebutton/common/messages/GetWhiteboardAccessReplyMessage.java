package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class GetWhiteboardAccessReplyMessage implements ISubscribedMessage {

	public static final String GET_WHITEBOARD_ACCESS_REPLY = "get_whiteboard_access_reply";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;
	public final boolean multiUser;

	public GetWhiteboardAccessReplyMessage(String meetingId, String requesterId, boolean multiUser) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.multiUser = multiUser;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.REQUESTER_ID, requesterId);
		payload.put(Constants.MULTI_USER, multiUser);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(GET_WHITEBOARD_ACCESS_REPLY, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static GetWhiteboardAccessReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (GET_WHITEBOARD_ACCESS_REPLY.equals(messageName)) {

					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.REQUESTER_ID)
							&& payload.has(Constants.MULTI_USER)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();
						boolean multiUser = payload.get(Constants.MULTI_USER).getAsBoolean();

						return new GetWhiteboardAccessReplyMessage(meetingId, requesterId, multiUser);
					}
				}
			}
		}
		return null;
	}
}
