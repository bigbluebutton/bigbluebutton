package org.bigbluebutton.red5.client.messaging;

public class DisconnectAllClientsMessage implements ClientMessage {

	private final String meetingId;
	
	public DisconnectAllClientsMessage(String meetingId) {
		this.meetingId = meetingId;
	}
	
	public String getMeetingId() {
		return meetingId;
	}

	public String getMessageName() {
		return "DisconnectAllClientsMessage";
	}
}
