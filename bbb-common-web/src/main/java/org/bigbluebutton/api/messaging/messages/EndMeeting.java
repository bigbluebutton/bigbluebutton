package org.bigbluebutton.api.messaging.messages;

public class EndMeeting implements IMessage {

	public final String meetingId;
	
	public EndMeeting(String meetingId) {
		this.meetingId = meetingId;
	}
}
