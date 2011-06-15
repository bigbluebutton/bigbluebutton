package org.bigbluebutton.api.messaging;

import java.util.Map;

public interface MessagingService {	
	void start();
	void stop();
	void recordMeetingInfo(String meetingId, Map<String, String> info);
	void recordMeetingMetadata(String meetingId, Map<String, String> metadata);
	void endMeeting(String meetingId);
	void send(String channel, String message);
	void addListener(MessageListener listener);
	void removeListener(MessageListener listener);
}
