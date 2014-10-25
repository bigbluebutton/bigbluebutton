package org.bigbluebutton.api.messaging;

import java.util.HashMap;

import org.bigbluebutton.api.messaging.converters.messages.CreateMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.DestroyMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.EndMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.KeepAliveMessage;
import org.bigbluebutton.api.messaging.converters.messages.RegisterUserMessage;

public class MessageToJson {

	public static String registerUserToJson(RegisterUserMessage message) {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, message.meetingID);
		payload.put(Constants.NAME, message.fullname);
		payload.put(Constants.USER_ID, message.internalUserId);
		payload.put(Constants.ROLE, message.role);
		payload.put(Constants.EXT_USER_ID, message.externUserID);
		payload.put(Constants.AUTH_TOKEN, message.authToken);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(RegisterUserMessage.REGISTER_USER, message.VERSION, null);

		return MessageBuilder.buildJson(header, payload);		
	}
	
	public static String createMeetingMessageToJson(CreateMeetingMessage msg) {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, msg.id);
		payload.put(Constants.NAME, msg.name);
		payload.put(Constants.RECORDED, msg.record);
		payload.put(Constants.VOICE_CONF, msg.voiceBridge);
		payload.put(Constants.DURATION, msg.duration);
		payload.put(Constants.AUTO_START_RECORDING, msg.autoStartRecording);
		payload.put(Constants.ALLOW_START_STOP_RECORDING, msg.allowStartStopRecording);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(CreateMeetingMessage.CREATE_MEETING_REQUEST_EVENT, CreateMeetingMessage.VERSION, null);
		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static String destroyMeetingMessageToJson(DestroyMeetingMessage msg) {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, msg.meetingId);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(DestroyMeetingMessage.DESTROY_MEETING_REQUEST_EVENT, DestroyMeetingMessage.VERSION, null);
		return MessageBuilder.buildJson(header, payload);				
	}	
	
	public static String endMeetingMessageToJson(EndMeetingMessage msg) {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, msg.meetingId);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(EndMeetingMessage.END_MEETING_REQUEST_EVENT, EndMeetingMessage.VERSION, null);
		return MessageBuilder.buildJson(header, payload);				
	}	

	public static String keepAliveMessageToJson(KeepAliveMessage msg) {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.KEEP_ALIVE_ID, msg.keepAliveId);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(KeepAliveMessage.KEEP_ALIVE_REQUEST, KeepAliveMessage.VERSION, null);
		return MessageBuilder.buildJson(header, payload);				
	}	
	
	
}
