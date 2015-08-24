package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class LockUserMessage implements IBigBlueButtonMessage {
	public static final String LOCK_USER = "lock_user";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;
	public final boolean lock;
	public final String internalUserId;


	public LockUserMessage(String meetingId, String requesterId, boolean lock, String internalUserId) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.lock = lock;
		this.internalUserId = internalUserId;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.REQUESTER_ID, requesterId);
		payload.put(Constants.LOCK, lock);
		payload.put(Constants.INTERNAL_USER_ID, internalUserId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(LOCK_USER, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static LockUserMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (LOCK_USER.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.REQUESTER_ID)
							&& payload.has(Constants.LOCK)
							&& payload.has(Constants.INTERNAL_USER_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();
						boolean lock = payload.get(Constants.LOCK).getAsBoolean();
						String internalUserId = payload.get(Constants.INTERNAL_USER_ID).getAsString();

						return new LockUserMessage(meetingId, requesterId, lock, internalUserId);
					}
				}
			}
		}
		return null;
	}
}
