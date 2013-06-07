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
	
	
}
