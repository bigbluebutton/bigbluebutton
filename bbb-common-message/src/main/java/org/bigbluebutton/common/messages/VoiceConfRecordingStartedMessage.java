package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class VoiceConfRecordingStartedMessage {
	public static final String VOICE_CONF_RECORDING_STARTED  = "voice_conf_recording_started_message";
	public static final String VERSION = "0.0.1";
	
	public static final String VOICE_CONF_ID = "voice_conf_id";
	public static final String RECORD_STREAM = "record_stream";
	public static final String RECORDING = "recording";
	public static final String TIMESTAMP = "timestamp";
	
	public final String voiceConfId;
	public final String recordStream;
	public final Boolean recording;
	public final String timestamp;
	
	public VoiceConfRecordingStartedMessage(String voiceConfId, 
			String recordStream, Boolean recording, String timestamp) {
		this.voiceConfId = voiceConfId;
		this.recordStream = recordStream;
		this.recording = recording;
		this.timestamp = timestamp;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(VOICE_CONF_ID, voiceConfId);
		payload.put(RECORD_STREAM, recordStream);
		payload.put(RECORDING, recording);
		payload.put(TIMESTAMP, timestamp);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(VOICE_CONF_RECORDING_STARTED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static VoiceConfRecordingStartedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (VOICE_CONF_RECORDING_STARTED.equals(messageName)) {
					if (payload.has(VOICE_CONF_ID)
							&& payload.has(RECORD_STREAM)
							&& payload.has(RECORDING)
							&& payload.has(TIMESTAMP)) {
						String voiceConfId = payload.get(VOICE_CONF_ID).getAsString();
						String recordStream = payload.get(RECORD_STREAM).getAsString();
						Boolean recording = payload.get(RECORDING).getAsBoolean();
						String timestamp = payload.get(TIMESTAMP).getAsString();
						return new VoiceConfRecordingStartedMessage(voiceConfId, recordStream, recording, timestamp);					
					}
				} 
			}
		}
		return null;

	}
}
