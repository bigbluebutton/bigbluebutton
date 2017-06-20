package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class GetGuestPolicyMessage implements IBigBlueButtonMessage {
	public static final String GET_GUEST_POLICY = "get_guest_policy";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;

	public GetGuestPolicyMessage(String meetingId, String requesterId) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.REQUESTER_ID, requesterId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(GET_GUEST_POLICY, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static GetGuestPolicyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (GET_GUEST_POLICY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.REQUESTER_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();

						return new GetGuestPolicyMessage(meetingId, requesterId);
					}
				}
			}
		}
		return null;
	}
}
