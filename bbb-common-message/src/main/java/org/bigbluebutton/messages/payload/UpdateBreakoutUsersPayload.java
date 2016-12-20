package org.bigbluebutton.messages.payload;

import java.util.ArrayList;

public class UpdateBreakoutUsersPayload {

	public final ArrayList<BreakoutUserPayload> users;
	public final String breakoutMeetingId;
	public final String parentMeetingId;

	public UpdateBreakoutUsersPayload(String meetingParentId, String breakoutMeetingId, ArrayList<BreakoutUserPayload> users) {
		this.parentMeetingId = meetingParentId;
		this.breakoutMeetingId = breakoutMeetingId;
	this.users = users;
	}
}
