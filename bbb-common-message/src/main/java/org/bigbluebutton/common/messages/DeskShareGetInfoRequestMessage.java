package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
/**
 * Created by anton on 21/12/15.
 */
public class DeskShareGetInfoRequestMessage {
	public static final String GET_DESKTOP_SHARE_GET_INFO_REQUEST  = "desktop_share_get_info_request";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;
	public final String replyTo;


	public DeskShareGetInfoRequestMessage(String meetingId, String requesterId, String replyTo) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
        this.replyTo = replyTo;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.REQUESTER_ID, requesterId);
		payload.put(Constants.REPLY_TO, replyTo);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(GET_DESKTOP_SHARE_GET_INFO_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static DeskShareGetInfoRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (GET_DESKTOP_SHARE_GET_INFO_REQUEST.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.REPLY_TO)
							&& payload.has(Constants.REQUESTER_ID)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();
						String replyTo = payload.get(Constants.REPLY_TO).getAsString();
						return new DeskShareGetInfoRequestMessage(id, requesterId, replyTo);
					}
				}
			}
		}
		return null;

	}
}
