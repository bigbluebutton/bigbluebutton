package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class GuestPolicyChangedMessage implements IBigBlueButtonMessage {
	public static final String GUEST_POLICY_CHANGED = "guest_policy_changed";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String policy;

	public GuestPolicyChangedMessage(String meetingId, String policy) {
		this.meetingId = meetingId;
		this.policy = policy;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.POLICY, policy);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(GUEST_POLICY_CHANGED, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static GuestPolicyChangedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (GUEST_POLICY_CHANGED.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.POLICY)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String policy = payload.get(Constants.POLICY).getAsString();

						return new GuestPolicyChangedMessage(meetingId, policy);
					}
				} 
			}
		}
		return null;
	}
}
