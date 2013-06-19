package org.bigbluebutton.conference.meeting.messaging.redis;

import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class MeetingMessageHandler implements MessageHandler {
	
	private static final String KEEP_ALIVE_REQUEST = "KEEP_ALIVE_REQUEST";
	
	private IBigBlueButtonInGW bbbGW;
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.SYSTEM_CHANNEL)){
			Gson gson = new Gson();
			HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
			String meetingId = map.get("meetingId");
			String messageId = map.get("messageId");
			if (messageId != null){
				if (MessagingConstants.END_MEETING_REQUEST_EVENT.equalsIgnoreCase(messageId)){
					bbbGW.endMeeting(meetingId);
				}
				if(messageId.equalsIgnoreCase(KEEP_ALIVE_REQUEST)){
					bbbGW.isAliveAudit();
				}
			}
		}
	}
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}
	
}
