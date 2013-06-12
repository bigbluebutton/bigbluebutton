package org.bigbluebutton.conference.service.presentation.messaging.messages;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class SharePresentationMessage extends OutMessage {
	private final String presentationID;
	private final Boolean share;
	
	public SharePresentationMessage(String meetingID, Boolean recorded, String presentationID, Boolean share) {
		super(meetingID, recorded);
		this.presentationID = presentationID;
		this.share = share;
	}

	public String getPresentationID() {
		return presentationID;
	}

	public Boolean getShare() {
		return share;
	}
	
	

}
