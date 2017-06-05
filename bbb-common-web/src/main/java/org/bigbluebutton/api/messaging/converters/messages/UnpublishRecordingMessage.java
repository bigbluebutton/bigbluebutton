package org.bigbluebutton.api.messaging.converters.messages;

public class UnpublishRecordingMessage {
	public static final String UNPUBLISH_RECORDING = "unpublished";
	public static final String VERSION = "0.0.1";

	public final String recordId;
	public final String meetingId;
	public final String externalMeetingId;
	public final String format;

	public UnpublishRecordingMessage(String recordId, String meetingId, String externalMeetingId, String format) {
		this.recordId = recordId;
		this.meetingId = meetingId;
		this.externalMeetingId = externalMeetingId;
		this.format = format;
	}
}
