package org.bigbluebutton.common.messages;

import java.util.Map;
import java.util.HashMap;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;


public class StopTranscoderReplyMessage implements IBigBlueButtonMessage {
	public static final String STOP_TRANSCODER_REPLY  = "stop_transcoder_reply_message";
	public static final String VERSION = "0.0.1";

	public static final String MEETING_ID = "meeting_id";
	public static final String TRANSCODER_ID = "transcoder_id";

	public final String meetingId;
	public final String transcoderId;

	public StopTranscoderReplyMessage(String meetingId, String transcoderId) {
		this.meetingId = meetingId;
		this.transcoderId = transcoderId;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId);
		payload.put(TRANSCODER_ID, transcoderId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(STOP_TRANSCODER_REPLY, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static StopTranscoderReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (STOP_TRANSCODER_REPLY.equals(messageName)) {
					if ( payload.has(MEETING_ID)
						&& payload.has(TRANSCODER_ID)){
						String meetingId = payload.get(MEETING_ID).getAsString();
						String transcoderId = payload.get(TRANSCODER_ID).getAsString();
						return new StopTranscoderReplyMessage(meetingId, transcoderId);
					}
				}
			}
		}
		return null;
	}
}
