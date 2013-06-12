package org.bigbluebutton.conference.service.presentation.messaging.messages;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class PresentationCursorUpdateMessage extends OutMessage {

	private final Double xPercent;
	private final Double yPercent;
	
	public PresentationCursorUpdateMessage(String meetingID, Boolean recorded, Double xPercent, Double yPercent) {
		super(meetingID, recorded);
		this.xPercent = xPercent;
		this.yPercent = yPercent;
	}

	public Double getxPercent() {
		return xPercent;
	}

	public Double getyPercent() {
		return yPercent;
	}
	
	

}
