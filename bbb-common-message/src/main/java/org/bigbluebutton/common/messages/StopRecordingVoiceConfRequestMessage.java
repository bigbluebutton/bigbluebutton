package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class StopRecordingVoiceConfRequestMessage {
	public static final String STOP_RECORD_VOICE_CONF_REQUEST  = "stop_recording_voice_conf_request_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String VOICE_CONF_ID = "voice_conf_id";
	public static final String RECORD_STREAM = "record_stream";
	
	public final String meetingId;
	public final String voiceConfId;
	public final String recordStream;

	public StopRecordingVoiceConfRequestMessage(String meetingId, String voiceConfId, String recordStream) {
		this.meetingId = meetingId;
		this.voiceConfId = voiceConfId;
		this.recordStream = recordStream;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(VOICE_CONF_ID, voiceConfId);
		payload.put(RECORD_STREAM, recordStream);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(STOP_RECORD_VOICE_CONF_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static StopRecordingVoiceConfRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (STOP_RECORD_VOICE_CONF_REQUEST.equals(messageName)) {
					if (payload.has(MEETING_ID) 
							&& payload.has(VOICE_CONF_ID)
							&& payload.has(RECORD_STREAM)) {
						String id = payload.get(MEETING_ID).getAsString();
						String voiceConfId = payload.get(VOICE_CONF_ID).getAsString();
						String recordStream = payload.get(RECORD_STREAM).getAsString();
						return new StopRecordingVoiceConfRequestMessage(id, voiceConfId, recordStream);					
					}
				} 
			}
		}
		return null;

	}
}
