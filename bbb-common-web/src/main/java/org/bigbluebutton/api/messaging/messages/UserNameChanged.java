package org.bigbluebutton.api.messaging.messages;

public class UserNameChanged implements IMessage {
	public final String meetingId;
	public final String userId;
	public final String newUserName;

	public UserNameChanged(String meetingId, String userId, String newUserName) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.newUserName = newUserName;
	}
}
