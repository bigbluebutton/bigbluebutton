package org.bigbluebutton.api.messaging.converters.messages;

public class DeleteRecordingMessage {
	public static final String DELETE_RECORDING = "deleted";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String externalMeetingId;
	public final String format;
	
	public DeleteRecordingMessage(String meetingId, String externalMeetingId, String format) {
		this.meetingId = meetingId;
		this.externalMeetingId = externalMeetingId;
		this.format = format;
	}
}
