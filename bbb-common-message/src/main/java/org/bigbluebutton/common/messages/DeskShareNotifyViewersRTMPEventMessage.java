package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

//Message from bbb-akka-apps to bbb-apps-red5
public class DeskShareNotifyViewersRTMPEventMessage {
	public static final String DESK_SHARE_NOTIFY_VIEWERS_RTMP  = "desk_share_notify_viewers_rtmp";
	public static final String VERSION = "0.0.1";

	public static final String MEETING_ID = "meeting_id";
	public static final String STREAM_PATH = "stream_path";
	public static final String BROADCASTING = "broadcasting";
	public static final String VIDEO_WIDTH = "vw";
	public static final String VIDEO_HEIGHT = "vh";

	public static final String TIMESTAMP = "timestamp";
	public final String meetingId;
	public final String streamPath;
	public final boolean broadcasting;
	public final String timestamp;
	public final int vw;
	public final int vh;

	public DeskShareNotifyViewersRTMPEventMessage(String meetingId, String streamPath,
			boolean broadcasting, int vw, int vh, String timestamp) {
		this.meetingId = meetingId;
		this.streamPath = streamPath;
		this.broadcasting = broadcasting;
		this.timestamp = timestamp;
		this.vw = vw;
		this.vh = vh;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId);
		payload.put(STREAM_PATH, streamPath);
		payload.put(BROADCASTING, broadcasting);
		payload.put(TIMESTAMP, timestamp);
		payload.put(VIDEO_HEIGHT, vh);
		payload.put(VIDEO_WIDTH, vw);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(DESK_SHARE_NOTIFY_VIEWERS_RTMP, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static DeskShareNotifyViewersRTMPEventMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (DESK_SHARE_NOTIFY_VIEWERS_RTMP.equals(messageName)) {
					if (payload.has(MEETING_ID)
							&& payload.has(BROADCASTING)
							&& payload.has(TIMESTAMP)
							&& payload.has(VIDEO_HEIGHT)
							&& payload.has(VIDEO_WIDTH)
							&& payload.has(STREAM_PATH)) {
						String meetingId = payload.get(MEETING_ID).getAsString();
						String streamPath = payload.get(STREAM_PATH).getAsString();
						boolean broadcasting = payload.get(BROADCASTING).getAsBoolean();
						String timestamp = payload.get(TIMESTAMP).getAsString();
						int vh = payload.get(VIDEO_HEIGHT).getAsInt();
						int vw = payload.get(VIDEO_WIDTH).getAsInt();

						return new DeskShareNotifyViewersRTMPEventMessage(meetingId, streamPath, broadcasting, vw, vh, timestamp);
					}
				}
			}
		}
		return null;

	}
}
