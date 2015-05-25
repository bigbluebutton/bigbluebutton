package org.bigbluebutton.red5.pub.messages;

public class EndMeetingMessage implements IPublishedMessage {
	public static final String END_MEETING_REQUEST_EVENT  = "end_meeting_request_event";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	
	public EndMeetingMessage(String meetingId) {
		this.meetingId = meetingId;
	}
}
