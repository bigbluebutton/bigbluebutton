package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class DeskShareRTMPBroadcastStoppedEventMessage {
	public static final String DESKSHARE_RTMP_BROADCAST_STOPPED_MESSAGE = "deskshare_rtmp_broadcast_stopped_message";
	public static final String VERSION = "0.0.1";

	public static final String CONFERENCE_NAME = "conference_name";
	public static final String STREAMNAME = "streamname";
	public static final String CHANNELS = "channels";
	public static final String SAMPLERATE = "samplerate";
	public static final String VIDEO_WIDTH = "vw";
	public static final String VIDEO_HEIGHT = "vh";
	public static final String FRAMES_PER_SECOND = "fps";
	public static final String TIMESTAMP = "timestamp";

	public final String conferenceName;
	public final String streamname;
	public final String timestamp;
	public final int channels;
	public final int samplerate;
	public final int vw;
	public final int vh;
	public final double fps;

	public DeskShareRTMPBroadcastStoppedEventMessage(String conferenceName, String streamname, int channels,
			int samplerate, int vw, int vh, double fps, String timestamp) {
		this.conferenceName = conferenceName;
		this.streamname = streamname;
		this.timestamp = timestamp;
		this.channels = channels;
		this.samplerate = samplerate;
		this.vw = vw;
		this.vh = vh;
		this.fps = fps;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(CONFERENCE_NAME, conferenceName);
		payload.put(STREAMNAME, streamname);
		payload.put(TIMESTAMP, timestamp);
		payload.put(CHANNELS, channels);
		payload.put(SAMPLERATE, samplerate);
		payload.put(VIDEO_HEIGHT, vh);
		payload.put(VIDEO_WIDTH, vw);
		payload.put(FRAMES_PER_SECOND, fps);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(DESKSHARE_RTMP_BROADCAST_STOPPED_MESSAGE, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static DeskShareRTMPBroadcastStoppedEventMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (DESKSHARE_RTMP_BROADCAST_STOPPED_MESSAGE.equals(messageName)) {
					if (payload.has(CONFERENCE_NAME)
							&& payload.has(TIMESTAMP)
							&& payload.has(CHANNELS)
							&& payload.has(SAMPLERATE)
							&& payload.has(VIDEO_HEIGHT)
							&& payload.has(VIDEO_WIDTH)
							&& payload.has(FRAMES_PER_SECOND)
							&& payload.has(STREAMNAME)) {
						String conferenceName = payload.get(CONFERENCE_NAME).getAsString();
						String streamname = payload.get(STREAMNAME).getAsString();
						String timestamp = payload.get(TIMESTAMP).getAsString();
						int channels = payload.get(CHANNELS).getAsInt();
						int samplerate = payload.get(SAMPLERATE).getAsInt();
						int vh = payload.get(VIDEO_HEIGHT).getAsInt();
						int vw = payload.get(VIDEO_WIDTH).getAsInt();
						double fps = payload.get(FRAMES_PER_SECOND).getAsDouble();

						return new DeskShareRTMPBroadcastStoppedEventMessage(conferenceName, streamname, channels,
								samplerate, vw, vh, fps, timestamp);
					}
				}
			}
		}
		return null;

	}
}
