package org.bigbluebutton.app.screenshare.messaging.redis;

import java.util.HashMap;
import java.util.Map;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import com.google.gson.Gson;
import org.bigbluebutton.common.messages.MessagingConstants;

public class MeetingMessageHandler implements MessageHandler {
	private static Logger log = Red5LoggerFactory.getLogger(MeetingMessageHandler.class, "screenshare");
	
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {

		if (channel.equalsIgnoreCase(MessagingConstants.TO_MEETING_CHANNEL)) {

//			IMessage msg = MessageFromJsonConverter.convert(message);			
//			if (msg != null) {

//			}
		} else if (channel.equalsIgnoreCase(MessagingConstants.TO_SYSTEM_CHANNEL)) {
//			IMessage msg = MessageFromJsonConverter.convert(message);
			
//			if (msg != null) {
//
//			}
		}
	}
	

	
}
