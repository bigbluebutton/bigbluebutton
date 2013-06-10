package org.bigbluebutton.conference.service.participants.messaging.redis;

import java.util.HashMap;

import org.bigbluebutton.conference.User;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageSender;

import com.google.gson.Gson;

public class UsersMessagePublisher {
	private MessageSender sender;
	
	public void participantStatusChange(String meetingID, User p, String status, Object value){
		HashMap<String,String> map= new HashMap<String, String>();
		map.put("meetingId", meetingID);
		map.put("messageId", MessagingConstants.USER_STATUS_CHANGE_EVENT);
			
		map.put("internalUserId", p.getInternalUserID());
		map.put("status", status);
		map.put("value", value.toString());
			
		Gson gson= new Gson();
		sender.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
	}
	
	public void participantJoined(String meetingID, User p) {
		HashMap<String,String> map= new HashMap<String, String>();
		map.put("meetingId", meetingID);
		map.put("messageId", MessagingConstants.USER_JOINED_EVENT);
		map.put("internalUserId", p.getInternalUserID());
		map.put("externalUserId", p.getExternalUserID());
		map.put("fullname", p.getName());
		map.put("role", p.getRole());
			
		Gson gson= new Gson();
		sender.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
	}
	
	public void participantLeft(String meetingID, User p) {		
		HashMap<String,String> map= new HashMap<String, String>();
		map.put("meetingId", meetingID);
		map.put("messageId", MessagingConstants.USER_LEFT_EVENT);
		map.put("internalUserId", p.getInternalUserID());
			
		Gson gson= new Gson();
		sender.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
	}
}
