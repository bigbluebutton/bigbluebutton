package org.bigbluebutton.api;

import java.util.Collection;
import org.bigbluebutton.api.domain.Meeting;

public interface MeetingService {
	public void cleanupOldMeetings();
	public Collection<Meeting> getMeetings();	
	public void storeMeeting(Meeting m);	
	public void endMeeting(String meetingId);
	public Meeting getMeeting(String meetingId);	
	public boolean isMeetingWithVoiceBridgeExist(String voiceBridge);
	void send(String channel, String message);
}
