package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class DeskShareRTMPBroadcastStartedEventMessage {
	public static final String DESKSHARE_RTMP_BROADCAST_STARTED_MESSAGE = "deskshare_rtmp_broadcast_started_message";
	public static final String VERSION = "0.0.1";

	public static final String CONFERENCE_NAME = "conference_name";
	public static final String STREAMNAME = "streamname";
	public static final String TIMESTAMP = "timestamp";

	public final String conferenceName;
	public final String streamname;
	public final String timestamp;

	public DeskShareRTMPBroadcastStartedEventMessage(String conferenceName, String streamname, String timestamp) {
		this.conferenceName = conferenceName;
		this.streamname = streamname;
		this.timestamp = timestamp;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(CONFERENCE_NAME, conferenceName);
		payload.put(STREAMNAME, streamname);
		payload.put(TIMESTAMP, timestamp);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(DESKSHARE_RTMP_BROADCAST_STARTED_MESSAGE, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static DeskShareRTMPBroadcastStartedEventMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (DESKSHARE_RTMP_BROADCAST_STARTED_MESSAGE.equals(messageName)) {
					if (payload.has(CONFERENCE_NAME)
							&& payload.has(TIMESTAMP)
							&& payload.has(STREAMNAME)) {
						String conferenceName = payload.get(CONFERENCE_NAME).getAsString();
						String streamname = payload.get(STREAMNAME).getAsString();
						String timestamp = payload.get(TIMESTAMP).getAsString();

						return new DeskShareRTMPBroadcastStartedEventMessage(conferenceName, streamname, timestamp);
					}
				}
			}
		}
		return null;

	}
}
