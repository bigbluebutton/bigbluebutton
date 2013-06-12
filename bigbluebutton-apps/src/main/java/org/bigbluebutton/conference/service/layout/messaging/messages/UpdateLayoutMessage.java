package org.bigbluebutton.conference.service.layout.messaging.messages;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class UpdateLayoutMessage extends OutMessage {
	private final Boolean locked;
	private final String setByUserID;
	private final String layout;
	
	public UpdateLayoutMessage(String meetingID, Boolean recorded, Boolean locked, String setByUserID, String layout) {
		super(meetingID, recorded);
		this.locked = locked;
		this.setByUserID = setByUserID;
		this.layout = layout;
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
