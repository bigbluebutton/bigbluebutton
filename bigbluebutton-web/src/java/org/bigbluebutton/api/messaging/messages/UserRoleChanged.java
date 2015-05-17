package org.bigbluebutton.api.messaging.messages;

public class UserRoleChanged implements IMessage {
	public final String meetingId;
	public final String userId;
	public final String role;

	public UserRoleChanged(String meetingId, String userId, String role) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.role = role;
	}
}
