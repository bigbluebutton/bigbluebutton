package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class RecordingStatusChangedMessage implements ISubscribedMessage {
	public static final String RECORDING_STATUS_CHANGED  = "recording_status_changed_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String userId;
	public final Boolean recording;

	public RecordingStatusChangedMessage(String meetingId, String userId, Boolean recording) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.recording = recording;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId); 
		payload.put(Constants.USER_ID, userId);
		payload.put(Constants.RECORDING, recording);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(RECORDING_STATUS_CHANGED, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static RecordingStatusChangedMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (RECORDING_STATUS_CHANGED.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.RECORDING)) {
						String id = payload.get(Constants.MEETING_ID).getAsString();
						String userid = payload.get(Constants.USER_ID).getAsString();
						Boolean recording = payload.get(Constants.RECORDING).getAsBoolean();
						return new RecordingStatusChangedMessage(id, userid, recording);					
					}
				} 
			}
		}
		return null;

	}
}
