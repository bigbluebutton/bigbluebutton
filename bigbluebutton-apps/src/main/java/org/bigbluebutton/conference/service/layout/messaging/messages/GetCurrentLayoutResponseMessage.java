package org.bigbluebutton.conference.service.layout.messaging.messages;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class GetCurrentLayoutResponseMessage extends OutMessage {
	private final String requesterID;
	private final Boolean locked;
	private final String setByUserID;
	private final String layout;
	
	public GetCurrentLayoutResponseMessage(String meetingID, Boolean recorded, String requesterID, Boolean locked, String setByUserID, String layout) {
		super(meetingID, recorded);
		this.requesterID = requesterID;
		this.locked = locked;
		this.setByUserID = setByUserID;
		this.layout = layout;
	}

	public String getRequesterID() {
		return requesterID;
	}
	
	public Boolean isLocked() {
		return locked;
	}

	public String getSetByUserID() {
		return setByUserID;
	}

	public String getLayout() {
		return layout;
	}

}
