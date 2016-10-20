package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class DeskShareStopRTMPBroadcastEventMessage {
	public static final String DESKSHARE_STOP_RTMP_BROADCAST_MESSAGE = "deskshare_stop_rtmp_broadcast_message";
	public static final String VERSION = "0.0.1";

	public static final String CONFERENCE_NAME = "conference_name";
	public static final String STREAMURL = "stream_url";
	public static final String TIMESTAMP = "timestamp";

	public final String conferenceName;
	public final String streamUrl;
	public final String timestamp;

	public DeskShareStopRTMPBroadcastEventMessage(String conferenceName, String streamUrl, String timestamp) {
		this.conferenceName = conferenceName;
		this.streamUrl = streamUrl;
		this.timestamp = timestamp;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(CONFERENCE_NAME, conferenceName);
		payload.put(STREAMURL, streamUrl);
		payload.put(TIMESTAMP, timestamp);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(DESKSHARE_STOP_RTMP_BROADCAST_MESSAGE, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static DeskShareStopRTMPBroadcastEventMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (DESKSHARE_STOP_RTMP_BROADCAST_MESSAGE.equals(messageName)) {
					if (payload.has(CONFERENCE_NAME)
							&& payload.has(TIMESTAMP)
							&& payload.has(STREAMURL)) {
						String conferenceName = payload.get(CONFERENCE_NAME).getAsString();
						String streamUrl = payload.get(STREAMURL).getAsString();
						String timestamp = payload.get(TIMESTAMP).getAsString();

						return new DeskShareStopRTMPBroadcastEventMessage(conferenceName, streamUrl, timestamp);
					}
				}
			}
		}
		return null;

	}
}
