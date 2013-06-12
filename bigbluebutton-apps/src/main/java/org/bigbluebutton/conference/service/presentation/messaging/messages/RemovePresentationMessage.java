package org.bigbluebutton.conference.service.presentation.messaging.messages;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class RemovePresentationMessage extends OutMessage {
	private final String presentationID;
	
	public RemovePresentationMessage(String meetingID, Boolean recorded, String presentationID) {
		super(meetingID, recorded);
		this.presentationID = presentationID;
	}

	public String getPresentationID() {
		return presentationID;
	}
}
