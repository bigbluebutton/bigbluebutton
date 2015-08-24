package org.bigbluebutton.common.messages;

public class DestroyMeetingMessage implements IBigBlueButtonMessage {
	public static final String DESTROY_MEETING_REQUEST_EVENT  = "destroy_meeting_request_event";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	
	public DestroyMeetingMessage(String meetingId) {
		this.meetingId = meetingId;
	}	
}
