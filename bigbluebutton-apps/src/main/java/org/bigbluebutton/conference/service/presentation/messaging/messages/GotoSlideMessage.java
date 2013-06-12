package org.bigbluebutton.conference.service.presentation.messaging.messages;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class GotoSlideMessage extends OutMessage {

	private final int num;
	
	public GotoSlideMessage(String meetingID, Boolean recorded, int num) {
		super(meetingID, recorded);
		this.num = num;
	}
	
	public int getNum() {
		return num;
	}

}
