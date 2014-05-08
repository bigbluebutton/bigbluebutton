package org.bigbluebutton.conference.meeting.messaging.redis;

import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class MeetingMessageHandler implements MessageHandler {
	private static Logger log = Red5LoggerFactory.getLogger(MeetingMessageHandler.class, "bigbluebutton");

	private static final String KEEP_ALIVE_REQUEST = "KEEP_ALIVE_REQUEST";
	
	private IBigBlueButtonInGW bbbGW;
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {
		log.debug("Checking message: " + pattern + " " + channel + " " + message);
		if (channel.equalsIgnoreCase(MessagingConstants.TO_MEETING_CHANNEL)) {
			Gson gson = new Gson();
			HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
			
			String messageId = map.get("messageId");
			if (messageId != null){
				if (MessagingConstants.END_MEETING_REQUEST_EVENT.equalsIgnoreCase(messageId)){
					String meetingId = map.get("meetingId");
					log.info("Received end meeting request. Meeting id [{}]", meetingId);
					bbbGW.endMeeting(meetingId);
				} else if(MessagingConstants.CREATE_MEETING_REQUEST_EVENT.equalsIgnoreCase(messageId)){
					String meetingID = map.get("meetingID");
					log.info("Received create meeting request. Meeting id [{}]", meetingID);
					Boolean record = Boolean.parseBoolean(map.get("record"));
					String voiceBridge = map.get("voiceBridge");		
					String meetingName = map.get("meetingName");
					Long duration = Long.parseLong(map.get("duration"));
					bbbGW.createMeeting2(meetingID, meetingName, record, voiceBridge, duration);
				} else if(MessagingConstants.DESTROY_MEETING_REQUEST_EVENT.equalsIgnoreCase(messageId)){
					String meetingID = map.get("meetingID");
					log.info("Received destroy meeting request. Meeting id [{}]", meetingID);
					bbbGW.destroyMeeting(meetingID);
				} else if (MessagingConstants.VALIDATE_AUTH_TOKEN.equals(messageId)) {
					String meetingId = map.get("meeting_id");
					String userId = map.get("user_id");
					String token = map.get("auth_token");
					String correlationId = map.get("correlation_id");
					bbbGW.validateAuthToken(meetingId, userId, token, correlationId);
				}
			}
		} else if (channel.equalsIgnoreCase(MessagingConstants.TO_SYSTEM_CHANNEL)) {
			Gson gson = new Gson();
			HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
			String messageId = map.get("messageId");
			if (messageId != null){
			  if(messageId.equalsIgnoreCase(KEEP_ALIVE_REQUEST)){
				  String keepAliveId = map.get("aliveId");
				  bbbGW.isAliveAudit(keepAliveId);			
			  }				
			}
		}
	}
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}
	
}
