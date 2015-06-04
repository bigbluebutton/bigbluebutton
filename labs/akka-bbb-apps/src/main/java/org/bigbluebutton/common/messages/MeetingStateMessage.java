package org.bigbluebutton.common.messages;

import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class MeetingStateMessage implements ISubscribedMessage {
	public static final String MEETING_STATE = "meeting_state_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final String userId;
	public final Map<String, Boolean> permissions;
	public final Boolean muted;
	
	public MeetingStateMessage(String meetingID, String userId, Map<String, Boolean> permissions, Boolean muted) {
		this.meetingId = meetingID;
		this.userId = userId;
		this.permissions = permissions;
		this.muted = muted;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(MEETING_STATE, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	public static MeetingStateMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (MEETING_STATE.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.PERMISSIONS)
							&& payload.has(Constants.MEETING_MUTED)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String userId = payload.get(Constants.USER_ID).getAsString();
						Boolean muted = payload.get(Constants.MEETING_MUTED).getAsBoolean();
						JsonObject premissions = (JsonObject) payload.get(Constants.PERMISSIONS);
						
						Util util = new Util();
						Map<String, Boolean> premissionsMap = util.extractPermission(premissions);
						
						if (premissionsMap != null) {
							return new MeetingStateMessage(meetingID, userId, premissionsMap, muted);							
						}						
					}
				}
			}
		}

		return null;
	}
}
