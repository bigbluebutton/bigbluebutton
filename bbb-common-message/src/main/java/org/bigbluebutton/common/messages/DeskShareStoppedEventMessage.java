package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

//Message from FreeSwitch to bbb-akka-apps
public class DeskShareStoppedEventMessage {
	public static final String DESK_SHARE_STOPPED_MESSAGE  = "desk_share_stopped_message";
	public static final String VERSION = "0.0.1";

	public static final String CONFERENCE_NAME = "conference_name";
	public static final String CALLER_ID = "caller_id";
	public static final String CALLER_ID_NAME = "caller_id_name";

	public final String conferenceName;
	public final String callerId;
	public final String callerIdName;

	public DeskShareStoppedEventMessage(String conferenceName, String callerId, String callerIdName) {
		this.conferenceName = conferenceName;
		this.callerId = callerId;
		this.callerIdName = callerIdName;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(CONFERENCE_NAME, conferenceName);
		payload.put(CALLER_ID_NAME, callerIdName);
		payload.put(CALLER_ID, callerId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(DESK_SHARE_STOPPED_MESSAGE, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static DeskShareStoppedEventMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (DESK_SHARE_STOPPED_MESSAGE.equals(messageName)) {
					if (payload.has(CONFERENCE_NAME)
							&& payload.has(CALLER_ID)
							&& payload.has(CALLER_ID_NAME)) {
						String conferenceName = payload.get(CONFERENCE_NAME).getAsString();
						String callerId = payload.get(CALLER_ID_NAME).getAsString();
						String callerIdName = payload.get(CALLER_ID_NAME).getAsString();

						return new DeskShareStoppedEventMessage(conferenceName, callerId, callerIdName);
					}
				}
			}
		}
		return null;

	}
}
