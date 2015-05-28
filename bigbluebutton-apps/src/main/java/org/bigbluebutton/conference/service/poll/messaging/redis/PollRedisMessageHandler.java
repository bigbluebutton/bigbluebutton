package org.bigbluebutton.conference.service.poll.messaging.redis;


import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class PollRedisMessageHandler implements MessageHandler {
	private static Logger log = Red5LoggerFactory.getLogger(PollRedisMessageHandler.class, "bigbluebutton");

	private IBigBlueButtonInGW bbbGW;
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {
//		log.debug("Checking message: " + pattern + " " + channel + " " + message);
		if (channel.equalsIgnoreCase(MessagingConstants.TO_POLLING_CHANNEL)){
			Gson gson = new Gson();
			JsonParser parser = new JsonParser();
			JsonObject obj = parser.parse(message).getAsJsonObject();
			String messageId = gson.fromJson(obj.get("messageId"), String.class);
			
			//HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
			
			//String messageId = map.get("messageId");
			if (messageId != null){
				if (MessagingConstants.SEND_POLLS_EVENT.equalsIgnoreCase(messageId)){
					String meetingId = gson.fromJson(obj.get("meetingId"), String.class);
					bbbGW.preCreatedPoll(meetingId, message);
				} 
			}
		}
	}
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}
	
}
