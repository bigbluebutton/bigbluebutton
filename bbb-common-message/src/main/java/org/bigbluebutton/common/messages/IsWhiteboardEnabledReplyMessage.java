package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class IsWhiteboardEnabledReplyMessage implements ISubscribedMessage {

	public static final String IS_WHITEBOARD_ENABLED_REPLY = "whiteboard_enabled_message";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;
	public final boolean enabled;


	public IsWhiteboardEnabledReplyMessage(String meetingId, String requesterId, boolean enabled) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.enabled = enabled;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.REQUESTER_ID, requesterId);
		payload.put(Constants.ENABLED, enabled);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(IS_WHITEBOARD_ENABLED_REPLY, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static IsWhiteboardEnabledReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (IS_WHITEBOARD_ENABLED_REPLY.equals(messageName)) {

					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.REQUESTER_ID)
							&& payload.has(Constants.ENABLED)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();
						boolean enabled = payload.get(Constants.ENABLED).getAsBoolean();

						return new IsWhiteboardEnabledReplyMessage(meetingId, requesterId, enabled);
					}
				}
			}
		}
		return null;
	}
}
