package org.bigbluebutton.api.messaging.converters.messages;

public class UnpublishRecordingMessage {
	public static final String UNPUBLISH_RECORDING = "unpublished";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	
	public UnpublishRecordingMessage(String meetingId) {
		this.meetingId = meetingId;
	}
}
