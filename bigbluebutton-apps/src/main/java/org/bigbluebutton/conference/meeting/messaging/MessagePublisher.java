package org.bigbluebutton.conference.meeting.messaging;

public interface MessagePublisher {

	void meetingStarted(String meetingID);
	void meetingEnded(String meetingID);
}
