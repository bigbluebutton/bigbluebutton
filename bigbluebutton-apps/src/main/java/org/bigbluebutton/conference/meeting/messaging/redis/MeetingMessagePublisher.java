package org.bigbluebutton.conference.meeting.messaging.redis;

import java.util.HashMap;
import org.bigbluebutton.conference.meeting.messaging.MessagePublisher;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageSender;

import com.google.gson.Gson;

public class MeetingMessagePublisher implements MessagePublisher {

	private MessageSender service;
		
	public void setMessageService(MessageSender service) {
		this.service = service;
	}

	@Override
	public void meetingStarted(String meetingID) {
		HashMap<String,String> map = new HashMap<String,String>();
		map.put("meetingId", meetingID);
		map.put("messageId", MessagingConstants.MEETING_STARTED_EVENT);
		
		Gson gson = new Gson();
		service.send(MessagingConstants.SYSTEM_CHANNEL, gson.toJson(map));	
	}

	@Override
	public void meetingEnded(String meetingID) {
		HashMap<String,String> map = new HashMap<String,String>();
		map.put("meetingId", meetingID);
		map.put("messageId", MessagingConstants.MEETING_ENDED_EVENT);
		
		Gson gson = new Gson();
		service.send(MessagingConstants.SYSTEM_CHANNEL, gson.toJson(map));
	}
	
	public void userStatusChange(String meetingID, String userID, String status, Object value) {
		HashMap<String,String> map= new HashMap<String, String>();
		map.put("meetingId", meetingID);
		map.put("messageId", MessagingConstants.USER_STATUS_CHANGE_EVENT);
			
		map.put("internalUserId", userID);
		map.put("status", status);
		map.put("value", value.toString());
			
		Gson gson= new Gson();
		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
	}
	
	public void userJoined(String meetingID, String internalUserID, String externalUserID, String name, String role) {
		HashMap<String,String> map= new HashMap<String, String>();
		map.put("meetingId", meetingID);
		map.put("messageId", MessagingConstants.USER_JOINED_EVENT);
		map.put("internalUserId", internalUserID);
		map.put("externalUserId", externalUserID);
		map.put("fullname", name);
		map.put("role", role);
			
		Gson gson= new Gson();
		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
	}
	
	public void userLeft(String meetingID, String internalUserID) {		
		HashMap<String,String> map= new HashMap<String, String>();
		map.put("meetingId", meetingID);
		map.put("messageId", MessagingConstants.USER_LEFT_EVENT);
		map.put("internalUserId", internalUserID);
			
		Gson gson= new Gson();
		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
	}
}
