package org.bigbluebutton.core.api;

import org.bigbluebutton.common.messages.*;

public interface IBigBlueButtonInGW {

	void handleBigBlueButtonMessage(IBigBlueButtonMessage message);

	void isAliveAudit(String aliveID);
	void statusMeetingAudit(String meetingID);
	void endMeeting(String meetingId);
	void endAllMeetings();

	void destroyMeeting(String meetingID);
	void getAllMeetings(String meetingID);
	void activityResponse(String meetingID);

	void setRecordingStatus(String meetingId, String userId, Boolean recording);
	void getRecordingStatus(String meetingId, String userId);
	
	// DeskShare
	void deskShareStarted(String confId, String callerId, String callerIdName);
	void deskShareStopped(String conferenceName, String callerId, String callerIdName);
	void deskShareRTMPBroadcastStarted(String conferenceName, String streamname, int videoWidth, int videoHeight, String timestamp);
	void deskShareRTMPBroadcastStopped(String conferenceName, String streamname, int videoWidth, int videoHeight, String timestamp);
	void deskShareGetInfoRequest(String meetingId, String requesterId, String replyTo);
}
