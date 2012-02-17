package org.bigbluebutton.api.messaging;

public interface MessageListener {
	void meetingStarted(String meetingId);
	void meetingEnded(String meetingId);
	void userJoined(String meetingId, String internalUserId, String externalUserId, String name, String role);
	void userLeft(String meetingId, String internalUserId);
	void updatedStatus(String meetingId, String internalUserId, String status, String value);
}
