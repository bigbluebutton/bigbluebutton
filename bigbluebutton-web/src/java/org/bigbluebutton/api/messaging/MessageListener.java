package org.bigbluebutton.api.messaging;

public interface MessageListener {
	void meetingStarted(String meetingId);
	void meetingEnded(String meetingId);
	void userJoined(String meetingId, String userId, String name, String role);
	void userLeft(String meetingId, String userId);
}
