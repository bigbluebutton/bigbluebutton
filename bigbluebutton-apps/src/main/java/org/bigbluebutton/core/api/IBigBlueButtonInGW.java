package org.bigbluebutton.core.api;

import java.util.Map;

public interface IBigBlueButtonInGW {

	void isAliveAudit(String aliveID);
	void statusMeetingAudit(String meetingID);
	void endMeeting(String meetingID);
	void endAllMeetings();
	void createMeeting2(String meetingID, boolean recorded, String voiceBridge);
	void destroyMeeting(String meetingID);
	
	// Users
  	void setUserStatus(String meetingID, String userID, String status, Object value);
	void getUsers(String meetingID, String requesterID);
	void userLeft(String meetingID, String userID);
	void userJoin(String meetingID, String userID, String username, String role, String externUserID);
	void getCurrentPresenter(String meetingID, String requesterID);
	void assignPresenter(String meetingID, String newPresenterID, String newPresenterName, String assignedBy);
	
	// Presentation
	void clear(String meetingID);
	void sendUpdateMessage(String meetingID, Map<String, Object> message);
	void removePresentation(String meetingID, String presentationID);
	void getPresentationInfo(String meetingID, String requesterID);
	void sendCursorUpdate(String meetingID, double xPercent, double yPercent);
	void resizeAndMoveSlide(String meetingID, double xOffset, double yOffset, double widthRatio, double heightRatio);
	void gotoSlide(String meetingID, int slide);
	void sharePresentation(String meetingID, String presentationID, boolean share);
	void getSlideInfo(String meetingID, String requesterID);
	
	// Polling
	void getPolls(String meetingID, String requesterID);
	void createPoll(String meetingID, String requesterID, String msg);
	void updatePoll(String meetingID, String requesterID, String msg);	
	void startPoll(String meetingID, String requesterID, String msg);
	void stopPoll(String meetingID, String requesterID, String msg);
	void removePoll(String meetingID, String requesterID, String msg);
	void respondPoll(String meetingID, String requesterID, String msg);
	void preCreatedPoll(String meetingID, String msg);
}
