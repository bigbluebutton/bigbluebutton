package org.bigbluebutton.api.messaging.messages;

public class StunTurnInfoRequested implements IMessage {
	public final String meetingId;
	public final String internalUserId;

	public StunTurnInfoRequested (String meetingId, String internalUserId) {
		this.meetingId = meetingId;
		this.internalUserId = internalUserId;
	}
}
