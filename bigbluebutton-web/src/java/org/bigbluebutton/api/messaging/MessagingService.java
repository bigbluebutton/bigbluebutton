package org.bigbluebutton.api.messaging;

import java.util.Map;

public interface MessagingService {	
	public void start();
	public void stop();
	public void recordMeetingInfo(String meetingId, Map<String, String> info);
	public void endMeeting(String meetingId);
	public void send(String channel, String message);
	public void addListener(MessageListener listener);
	public void removeListener(MessageListener listener);
	public void recordMeeting(String meetingID, String externalID, String name);
	public void removeMeeting(String meetingId);
	public void recordPresentation(String room, String name, int numberOfPages);
}
