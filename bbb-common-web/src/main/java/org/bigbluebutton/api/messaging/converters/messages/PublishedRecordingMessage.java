package org.bigbluebutton.api.messaging.converters.messages;

public class PublishedRecordingMessage {
	public static final String PUBLISHED_RECORDING_EVENT = "published_recording_event";
	public static final String VERSION = "0.0.1";

	public final String recordId;

	public PublishedRecordingMessage(String recordId) {
		this.recordId = recordId;
	}
}
