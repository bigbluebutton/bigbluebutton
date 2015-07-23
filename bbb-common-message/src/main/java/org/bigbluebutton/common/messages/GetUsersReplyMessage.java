package org.bigbluebutton.common.messages;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class GetUsersReplyMessage implements ISubscribedMessage {
	public static final String GET_USERS_REPLY = "get_users_reply";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;
	public final ArrayList<Map<String, Object>> users;
	
	public GetUsersReplyMessage(String meetingID, String requesterId, ArrayList<Map<String, Object>> users) {
		this.meetingId = meetingID;
		this.requesterId = requesterId;
		this.users = users;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(GET_USERS_REPLY, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static GetUsersReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (GET_USERS_REPLY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.REQUESTER_ID)
							&& payload.has(Constants.USERS)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();

						JsonArray users = (JsonArray) payload.get(Constants.USERS);
						
						Util util = new Util();
						ArrayList<Map<String, Object>> usersList = util.extractUsers(users);
						
						if (usersList != null) {
							return new GetUsersReplyMessage(meetingID, requesterId, usersList);							
						}						
					}
				}
			}
		}

		return null;
	}
}
