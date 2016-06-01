package org.bigbluebutton.messages.payload;

public class BreakoutRoomPayload {

	public final String meetingId;
	public final String breakoutId;
	public final String name;

	public BreakoutRoomPayload(String meetingId, String breakoutId, String name) {
		this.meetingId = meetingId;
		this.breakoutId = breakoutId;
		this.name = name;
	}
}
