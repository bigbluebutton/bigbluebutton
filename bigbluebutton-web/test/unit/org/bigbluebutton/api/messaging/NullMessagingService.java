package org.bigbluebutton.api.messaging;

import java.util.Map;

public class NullMessagingService implements MessagingService {

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

	/*@Override
	public void recordMeetingMetadata(String meetingId,
			Map<String, String> metadata) {
		// TODO Auto-generated method stub

	}*/

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
