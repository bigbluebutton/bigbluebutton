package org.bigbluebutton.conference.meeting.messaging.red5;

public class DisconnectAllClientsMessage implements ClientMessage {

	private final String meetingId;
	
	public DisconnectAllClientsMessage(String meetingId) {
		this.meetingId = meetingId;
	}
	
	public String getMeetingId() {
		return meetingId;
	}
}
