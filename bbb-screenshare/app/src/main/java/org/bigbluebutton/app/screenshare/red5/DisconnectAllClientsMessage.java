package org.bigbluebutton.app.screenshare.red5;

public class DisconnectAllClientsMessage implements ClientMessage {

	private final String meetingId;
	
	public DisconnectAllClientsMessage(String meetingId) {
		this.meetingId = meetingId;
	}
	
	public String getMeetingId() {
		return meetingId;
	}
}
