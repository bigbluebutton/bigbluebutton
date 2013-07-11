package org.bigbluebutton.conference.meeting.messaging.redis;

import java.util.HashMap;
import org.bigbluebutton.conference.meeting.messaging.OutMessage;
import org.bigbluebutton.conference.meeting.messaging.OutMessageListener;
import org.bigbluebutton.conference.meeting.messaging.messages.MeetingEndedMessage;
import org.bigbluebutton.conference.meeting.messaging.messages.MeetingStartedMessage;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageSender;

import com.google.gson.Gson;

public class MeetingMessagePublisher implements OutMessageListener {

	private MessageSender service;
		
	public void setMessageService(MessageSender service) {
		this.service = service;
	}
	
	@Override
	public void send(OutMessage msg) {
		if (msg instanceof MeetingStartedMessage) {
			meetingStarted((MeetingStartedMessage) msg);
		} else if (msg instanceof MeetingEndedMessage) {
			meetingEnded((MeetingEndedMessage) msg);
		}
	}

	private void meetingStarted(MeetingStartedMessage msg) {
		HashMap<String,String> map = new HashMap<String,String>();
		map.put("meetingID", msg.getMeetingID());
		map.put("messageID", MessagingConstants.MEETING_STARTED_EVENT);
		
		Gson gson = new Gson();
		service.send(MessagingConstants.SYSTEM_CHANNEL, gson.toJson(map));	
		
		service.send(MessagingConstants.BIGBLUEBUTTON_WEBHOOK_EVENTS, gson.toJson(map));
	}

	private void meetingEnded(MeetingEndedMessage msg) {
		HashMap<String,String> map = new HashMap<String,String>();
		map.put("meetingID", msg.getMeetingID());
		map.put("messageID", MessagingConstants.MEETING_ENDED_EVENT);
		
		Gson gson = new Gson();
		service.send(MessagingConstants.SYSTEM_CHANNEL, gson.toJson(map));
		
		service.send(MessagingConstants.BIGBLUEBUTTON_WEBHOOK_EVENTS, gson.toJson(map));
	}

}
