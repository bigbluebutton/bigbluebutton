package org.bigbluebutton.api.messaging;


import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;



public class RedisMessagingService implements MessagingService {
	private static Logger log = LoggerFactory.getLogger(RedisMessagingService.class);

	@Override
	public void start() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void stop() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void recordMeetingInfo(String meetingId, Map<String, String> info) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void recordMeetingMetadata(String meetingId,
			Map<String, String> metadata) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void endMeeting(String meetingId) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void send(String channel, String message) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void addListener(MessageListener listener) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void removeListener(MessageListener listener) {
		// TODO Auto-generated method stub
		
	}

}
