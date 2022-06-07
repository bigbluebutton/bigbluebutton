package org.bigbluebutton.api.messaging.messages;

import org.bigbluebutton.api.domain.Meeting;

public class CreateMeeting implements IMessage {

	public final Meeting meeting;
	
	public CreateMeeting(Meeting meeting) {
		this.meeting = meeting;
	}
}
