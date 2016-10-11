package org.bigbluebutton.messages.payload;

public class BreakoutRoomPayload {

	public final String parentMeetingId;
	public final String meetingId;
	public final String name;

	public BreakoutRoomPayload(String parentMeetingId, String meetingId, String name) {
		this.parentMeetingId = parentMeetingId;
		this.meetingId = meetingId;
		this.name = name;
	}
}
