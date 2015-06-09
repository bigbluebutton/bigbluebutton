package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class RecordVoiceConfRequestMessage {
	public static final String RECORD_VOICE_CONF_REQUEST  = "record_voice_conf_request_message";
	public static final String VERSION = "0.0.1";
	
	public static final String MEETING_ID = "meeting_id";
	public static final String VOICE_CONF_ID = "voice_conf_id";
	public static final String RECORD = "record";
	
	public final String meetingId;
	public final String voiceConfId;
	public final Boolean record;

	public RecordVoiceConfRequestMessage(String meetingId, String voiceConfId, Boolean record) {
		this.meetingId = meetingId;
		this.voiceConfId = voiceConfId;
		this.record = record;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(MEETING_ID, meetingId); 
		payload.put(VOICE_CONF_ID, voiceConfId);
		payload.put(RECORD, record);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(RECORD_VOICE_CONF_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static RecordVoiceConfRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (RECORD_VOICE_CONF_REQUEST.equals(messageName)) {
					if (payload.has(MEETING_ID) 
							&& payload.has(VOICE_CONF_ID)
							&& payload.has(RECORD)) {
						String id = payload.get(MEETING_ID).getAsString();
						String voiceConfId = payload.get(VOICE_CONF_ID).getAsString();
						Boolean record = payload.get(RECORD).getAsBoolean();
						return new RecordVoiceConfRequestMessage(id, voiceConfId, record);					
					}
				} 
			}
		}
		return null;

	}
}
