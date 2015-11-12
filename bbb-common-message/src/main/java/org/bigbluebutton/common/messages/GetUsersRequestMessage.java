package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class GetUsersRequestMessage implements IBigBlueButtonMessage {
	public static final String GET_USERS_REQUEST = "get_users_request_message";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;


	public GetUsersRequestMessage(String meetingId, String requesterId) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.REQUESTER_ID, requesterId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(GET_USERS_REQUEST, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static GetUsersRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (GET_USERS_REQUEST.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.REQUESTER_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();

						return new GetUsersRequestMessage(meetingId, requesterId);
					}
				} 
			}
		}
		return null;
	}
}
