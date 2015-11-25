package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class GetGuestPolicyReplyMessage implements IBigBlueButtonMessage {
	public static final String GET_GUEST_POLICY_REPLY = "get_guest_policy_reply";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;
	public final String policy;

	public GetGuestPolicyReplyMessage(String meetingId, String requesterId, String policy) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.policy = policy;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.REQUESTER_ID, requesterId);
		payload.put(Constants.POLICY, policy);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(GET_GUEST_POLICY_REPLY, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static GetGuestPolicyReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (GET_GUEST_POLICY_REPLY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.REQUESTER_ID)
							&& payload.has(Constants.POLICY)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();
						String policy = payload.get(Constants.POLICY).getAsString();

						return new GetGuestPolicyReplyMessage(meetingId, requesterId, policy);
					}
				} 
			}
		}
		return null;
	}
}
