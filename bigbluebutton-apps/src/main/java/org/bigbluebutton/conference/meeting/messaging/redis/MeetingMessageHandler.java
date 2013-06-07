package org.bigbluebutton.conference.meeting.messaging.redis;

import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.conference.MeetingsManager;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class MeetingMessageHandler implements MessageHandler {
	
	private MeetingsManager meetingManager;
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {
		Gson gson = new Gson();
		HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
		if (channel.equalsIgnoreCase(MessagingConstants.SYSTEM_CHANNEL)){
			String meetingId = map.get("meetingId");
			String messageId = map.get("messageId");
			if (messageId != null){
				if (MessagingConstants.END_MEETING_REQUEST_EVENT.equalsIgnoreCase(messageId)){
					meetingManager.endMeeting(meetingId);
				}
			}
		}
	}
	
	public void setMeetingManager(MeetingsManager manager) {
		meetingManager = manager;
	}
	
}
