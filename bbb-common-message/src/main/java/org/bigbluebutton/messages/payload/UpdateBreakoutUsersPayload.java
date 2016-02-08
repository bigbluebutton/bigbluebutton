package org.bigbluebutton.messages.payload;

public class UpdateBreakoutUsersPayload {

	public final Integer numberOfUsers;
	public final String breakoutId;
	public final String meetingId;

	public UpdateBreakoutUsersPayload(String meetingId, String breakoutId,
			Integer numberOfUsers) {
		this.meetingId = meetingId;
		this.breakoutId = breakoutId;
		this.numberOfUsers = numberOfUsers;
	}
}
