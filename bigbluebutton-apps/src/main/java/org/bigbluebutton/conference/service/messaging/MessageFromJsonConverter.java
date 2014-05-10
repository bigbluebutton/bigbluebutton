package org.bigbluebutton.conference.service.messaging;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class MessageFromJsonConverter {

	public static IMessage convert(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				switch (messageName) {
				  case CreateMeetingMessage.CREATE_MEETING_REQUEST_EVENT:
					return processCreateMeeting(payload);
				  case DestroyMeetingMessage.DESTROY_MEETING_REQUEST_EVENT:
					return processDestroyMeeting(payload);
				  case EndMeetingMessage.END_MEETING_REQUEST_EVENT:
					return processEndMeetingMessage(payload);
				  case KeepAliveMessage.KEEP_ALIVE_REQUEST:
					return processKeepAlive(payload);
				}
			}
		}
		return null;
	}
		
	private static IMessage processCreateMeeting(JsonObject payload) {
		String id = payload.get(Constants.MEETING_ID).getAsString();
		String name = payload.get(Constants.MEETING_ID).getAsString();
		Boolean record = payload.get(Constants.RECORDED).getAsBoolean();
		String voiceBridge = payload.get(Constants.VOICE_CONF).getAsString();
		Long duration = payload.get(Constants.DURATION).getAsLong();
		
		return new CreateMeetingMessage(id, name, record, voiceBridge, duration);
	}
	
	private static IMessage processDestroyMeeting(JsonObject payload) {
		String id = payload.get(Constants.MEETING_ID).getAsString();		
		return new DestroyMeetingMessage(id);
	}
	
	private static IMessage processEndMeetingMessage(JsonObject payload) {
		String id = payload.get(Constants.MEETING_ID).getAsString();		
		return new EndMeetingMessage(id);
	}	
	
	private static IMessage processKeepAlive(JsonObject payload) {
		String id = payload.get(Constants.KEEP_ALIVE_ID).getAsString();		
		return new KeepAliveMessage(id);
	}
}
