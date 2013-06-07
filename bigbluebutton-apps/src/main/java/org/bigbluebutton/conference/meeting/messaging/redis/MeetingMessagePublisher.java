package org.bigbluebutton.conference.meeting.messaging.redis;

import java.util.HashMap;

import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.MessagingService;

import com.google.gson.Gson;

public class MeetingMessagePublisher {

	private MessagingService service;
	
	public void sendMessage(String meetingID) {
		HashMap<String,String> map = new HashMap<String,String>();
		map.put("meetingId", meetingID);
		map.put("messageId", MessagingConstants.MEETING_STARTED_EVENT);
		
		Gson gson = new Gson();
		service.send(MessagingConstants.SYSTEM_CHANNEL, gson.toJson(map));		
	}
	
	public void setMessageService(MessagingService service) {
		this.service = service;
	}
}
