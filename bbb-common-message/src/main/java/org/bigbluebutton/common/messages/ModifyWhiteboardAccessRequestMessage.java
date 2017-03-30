package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class ModifyWhiteboardAccessRequestMessage implements ISubscribedMessage {
	public static final String MODIFY_WHITEBOARD_ACCESS_REQUEST = "modify_whiteboard_access_request";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;
	public final boolean multiUser;

	public ModifyWhiteboardAccessRequestMessage(String meetingId,
			String requesterId, boolean multiUser) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.multiUser = multiUser;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.REQUESTER_ID, requesterId);
		payload.put(Constants.MULTI_USER, multiUser);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(MODIFY_WHITEBOARD_ACCESS_REQUEST, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static ModifyWhiteboardAccessRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (MODIFY_WHITEBOARD_ACCESS_REQUEST.equals(messageName)) {

					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.MULTI_USER)
							&& payload.has(Constants.REQUESTER_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();
						boolean multiUser = payload.get(Constants.MULTI_USER).getAsBoolean();

						return new ModifyWhiteboardAccessRequestMessage(meetingId, requesterId, multiUser);
					}
				}
			}
		}
		return null;
	}
}
