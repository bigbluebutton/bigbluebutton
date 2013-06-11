package org.bigbluebutton.conference.service.participants.messaging.messages;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class AssignPresenterMessage extends OutMessage {

	private final String newPresenterID;
	private final String newPresenterName;
	private final String assignedBy;
	
	public AssignPresenterMessage(String meetingID, Boolean recorded, String newPresenterID, String newPresenterName, String assignedBy) {
		super(meetingID, recorded);
		this.newPresenterID = newPresenterID;
		this.newPresenterName = newPresenterName;
		this.assignedBy = assignedBy;
	}

	public String getNewPresenterID() {
		return newPresenterID;
	}

	public String getNewPresenterName() {
		return newPresenterName;
	}

	public String getAssignedBy() {
		return assignedBy;
	}
}
