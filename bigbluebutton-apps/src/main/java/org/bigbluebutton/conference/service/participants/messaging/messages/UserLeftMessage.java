package org.bigbluebutton.conference.service.participants.messaging.messages;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class UserLeftMessage extends OutMessage {

	private final String userID;
	
	public UserLeftMessage(String meetingID, Boolean recorded, String internalUserID) {
		super(meetingID, recorded);
		this.userID = internalUserID;
	}
	
	public String getUserID() {
		return userID;
	}
}
