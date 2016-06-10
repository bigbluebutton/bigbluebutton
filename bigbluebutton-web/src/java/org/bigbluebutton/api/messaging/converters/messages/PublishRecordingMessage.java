package org.bigbluebutton.api.messaging.converters.messages;

public class PublishRecordingMessage {
	public static final String PUBLISH_RECORDING = "published";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	
	public PublishRecordingMessage(String meetingId) {
		this.meetingId = meetingId;
	}
}
