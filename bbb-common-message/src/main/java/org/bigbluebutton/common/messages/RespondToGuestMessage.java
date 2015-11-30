
package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class RespondToGuestMessage implements IBigBlueButtonMessage {
	public static final String RESPOND_TO_GUEST = "respond_to_guest";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String userId;
	public final Boolean response;
	public final String requesterId;

	public RespondToGuestMessage(String meetingId, String userId, Boolean response, String requesterId) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.response = response;
		this.requesterId = requesterId;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.USER_ID, userId);
		payload.put(Constants.RESPONSE, response);
		payload.put(Constants.REQUESTER_ID, requesterId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(RESPOND_TO_GUEST, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static RespondToGuestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (RESPOND_TO_GUEST.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.RESPONSE)
							&& payload.has(Constants.REQUESTER_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String userId = payload.get(Constants.USER_ID).getAsString();
						Boolean response = payload.get(Constants.RESPONSE).getAsBoolean();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();

						return new RespondToGuestMessage(meetingId, userId, response, requesterId);
					}
				} 
			}
		}
		return null;
	}
}
