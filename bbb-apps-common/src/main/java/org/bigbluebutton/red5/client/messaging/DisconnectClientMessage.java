package org.bigbluebutton.red5.client.messaging;

public class DisconnectClientMessage implements ClientMessage {

	private final String meetingId;
	private final String userId;
	
	public DisconnectClientMessage(String meetingId, String userId) {
		this.meetingId = meetingId;
		this.userId = userId;
	}
	
	public String getMeetingId() {
		return meetingId;
	}
	
	public String getUserId() {
		return userId;
	}

	public String getMessageName() {
		return "DisconnectClientMessage";
	}
}
