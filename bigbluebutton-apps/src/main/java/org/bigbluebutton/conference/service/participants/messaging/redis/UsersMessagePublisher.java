package org.bigbluebutton.conference.service.participants.messaging.redis;

import java.util.HashMap;
import org.bigbluebutton.conference.meeting.messaging.OutMessage;
import org.bigbluebutton.conference.meeting.messaging.OutMessageListener;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageSender;
import org.bigbluebutton.conference.service.participants.messaging.messages.UserJoinedMessage;
import org.bigbluebutton.conference.service.participants.messaging.messages.UserLeftMessage;
import org.bigbluebutton.conference.service.participants.messaging.messages.UserStatusChangeMessage;

import com.google.gson.Gson;

public class UsersMessagePublisher implements OutMessageListener {
	private MessageSender service;
	
	public void setMessageService(MessageSender service) {
		this.service = service;
	}
	
	@Override
	public void send(OutMessage msg) {
		if (msg instanceof UserStatusChangeMessage) {
			userStatusChange((UserStatusChangeMessage) msg);
		} else if (msg instanceof UserJoinedMessage) {
			userJoined((UserJoinedMessage) msg);
		} else if (msg instanceof UserLeftMessage) {
			userLeft((UserLeftMessage) msg);
		}
		
	}
	
	private void userStatusChange(UserStatusChangeMessage msg) {
		HashMap<String,String> map= new HashMap<String, String>();
		map.put("meetingId", msg.getMeetingID());
		map.put("messageId", MessagingConstants.USER_STATUS_CHANGE_EVENT);
			
		map.put("internalUserId", msg.getUserID());
		map.put("status", msg.getStatus());
		map.put("value", msg.getValue().toString());
			
		Gson gson= new Gson();
		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
	}
	
	private void userJoined(UserJoinedMessage msg) {
		HashMap<String,String> map= new HashMap<String, String>();
		map.put("meetingId", msg.getMeetingID());
		map.put("messageId", MessagingConstants.USER_JOINED_EVENT);
		map.put("internalUserId", msg.getUserID());
		map.put("externalUserId", msg.getExternalUserID());
		map.put("fullname", msg.getName());
		map.put("role", msg.getRole());
			
		Gson gson= new Gson();
		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
	}
	
	private void userLeft(UserLeftMessage msg) {		
		HashMap<String,String> map= new HashMap<String, String>();
		map.put("meetingId", msg.getMeetingID());
		map.put("messageId", MessagingConstants.USER_LEFT_EVENT);
		map.put("internalUserId", msg.getUserID());
			
		Gson gson= new Gson();
		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
	}
}
