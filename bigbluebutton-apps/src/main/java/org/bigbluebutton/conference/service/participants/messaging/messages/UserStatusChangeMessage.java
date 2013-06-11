package org.bigbluebutton.conference.service.participants.messaging.messages;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class UserStatusChangeMessage extends OutMessage {

	private final String userID;
	private final String status;
	private final Object value;
	
	public UserStatusChangeMessage(String meetingID, Boolean recorded, String userID, String status, Object value) {
		super(meetingID, recorded);
		this.userID = userID;
		this.status = status;
		this.value = value;
	}

	public String getUserID() {
		return userID;
	}

	public String getStatus() {
		return status;
	}

	public Object getValue() {
		return value;
	}
	
}
