package org.bigbluebutton.common.messages;

import java.util.Map;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class MessageFromJsonConverter {

	public static IBigBlueButtonMessage convert(String message) {
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
				  case ActivityResponseMessage.ACTIVITY_RESPONSE:
					  return processActivityResponseMessage(payload);
				  case GetAllMeetingsRequest.GET_ALL_MEETINGS_REQUEST_EVENT:
					return new GetAllMeetingsRequest("the_string_is_not_used_anywhere");
				}
			}
		}
		return null;
	}
	
	private static IBigBlueButtonMessage processCreateMeeting(JsonObject payload) {
		String id = payload.get(Constants.MEETING_ID).getAsString();
		String externalId = payload.get(Constants.EXTERNAL_MEETING_ID).getAsString();
		String name = payload.get(Constants.NAME).getAsString();
		Boolean record = payload.get(Constants.RECORDED).getAsBoolean();
		String voiceBridge = payload.get(Constants.VOICE_CONF).getAsString();
		Long duration = payload.get(Constants.DURATION).getAsLong();
		Boolean autoStartRecording = payload.get(Constants.AUTO_START_RECORDING).getAsBoolean();
		Boolean allowStartStopRecording = payload.get(Constants.ALLOW_START_STOP_RECORDING).getAsBoolean();
		Boolean webcamsOnlyForModerator = payload.get(Constants.WEBCAMS_ONLY_FOR_MODERATOR).getAsBoolean();
		String moderatorPassword = payload.get(Constants.MODERATOR_PASS).getAsString();
		String viewerPassword = payload.get(Constants.VIEWER_PASS).getAsString();
		Long createTime = payload.get(Constants.CREATE_TIME).getAsLong();
		String createDate = payload.get(Constants.CREATE_DATE).getAsString();

		Util util = new Util();
		JsonObject metadataObject = (JsonObject) payload.get(Constants.METADATA);
		Map<String, String> metadata = util.extractMetadata(metadataObject);
		
		return new CreateMeetingMessage(id, externalId, name, record, voiceBridge, 
				          duration, autoStartRecording, allowStartStopRecording,
				          webcamsOnlyForModerator, moderatorPassword, viewerPassword,
				          createTime, createDate, metadata);
	}
	
	private static IBigBlueButtonMessage processDestroyMeeting(JsonObject payload) {
		String id = payload.get(Constants.MEETING_ID).getAsString();		
		return new DestroyMeetingMessage(id);
	}
	
	private static IBigBlueButtonMessage processEndMeetingMessage(JsonObject payload) {
		String id = payload.get(Constants.MEETING_ID).getAsString();		
		return new EndMeetingMessage(id);
	}	
	
	private static IBigBlueButtonMessage processKeepAlive(JsonObject payload) {
		String id = payload.get(Constants.KEEP_ALIVE_ID).getAsString();		
		return new KeepAliveMessage(id);
	}

	private static IBigBlueButtonMessage processActivityResponseMessage(JsonObject payload) {
		String id = payload.get(Constants.MEETING_ID).getAsString();
		return new ActivityResponseMessage(id);
	}
}
