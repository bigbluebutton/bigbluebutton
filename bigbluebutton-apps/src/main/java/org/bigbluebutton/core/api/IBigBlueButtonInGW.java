package org.bigbluebutton.core.api;

public interface IBigBlueButtonInGW {

	void createMeeting2(String meetingID, boolean recorded, String voiceBridge);
	
  	void setUserStatus(String meetingID, String userID, String status, Object value);
	
	void getUsers(String meetingID, String requesterID);
	
	void userLeft(String meetingID, String userID);
	
	void userJoin(String meetingID, String userID, String username, String role, String externUserID);
	
	void getCurrentPresenter(String meetingID, String requesterID);
	
	void assignPresenter(String meetingID, String newPresenterID, String newPresenterName, String assignedBy);
}
