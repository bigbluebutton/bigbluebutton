package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class SetGuestPolicyMessage implements IBigBlueButtonMessage {
	public static final String SET_GUEST_POLICY = "set_guest_policy";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String guestPolicy;
	public final String setBy;

	public SetGuestPolicyMessage(String meetingId, String guestPolicy, String setBy) {
		this.meetingId = meetingId;
		this.guestPolicy = guestPolicy;
		this.setBy = setBy;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.GUEST_POLICY, guestPolicy);
		payload.put(Constants.SET_BY, setBy);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(SET_GUEST_POLICY, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static SetGuestPolicyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (SET_GUEST_POLICY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.GUEST_POLICY)
							&& payload.has(Constants.SET_BY)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String guestPolicy = payload.get(Constants.GUEST_POLICY).getAsString();
						String setBy = payload.get(Constants.SET_BY).getAsString();

						return new SetGuestPolicyMessage(meetingId, guestPolicy, setBy);
					}
				}
			}
		}
		return null;
	}
}
