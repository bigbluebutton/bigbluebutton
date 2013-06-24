package org.bigbluebutton.conference.service.poll;

public interface PollInGW {
	void createPoll(String meetingID, String requesterID, String msg);

	void updatePoll(String meetingID, String requesterID, String msg);
	
	void startPoll(String meetingID, String requesterID, String msg);
	
	void stopPoll(String meetingID, String requesterID, String msg);
	
	void removePoll(String meetingID, String requesterID, String msg);
	
	void respondPoll(String meetingID, String requesterID, String msg);
}
