package org.bigbluebutton.api.messaging;

import java.util.Map;

public abstract class MessagingService {
	
	//patterns
	public static String MEETING_EVENTS="bigbluebutton:meeting:*";
	public static String PRESENTATION_CHANNEL="bigbluebutton:meeting:presentation";
	
	public void start(){}
	public void stop(){}
	public void recordMeetingInfo(String meetingId, Map<String, String> info){}
	public void recordMeetingMetadata(String meetingId, Map<String, String> metadata){}
	public void endMeeting(String meetingId){}
	public void send(String channel, String message){}
	public void addListener(MessageListener listener){}
	public void removeListener(MessageListener listener){}
}
