package org.bigbluebutton.api.messaging.converters.messages;

public class UnpublishedRecordingMessage {
	public static final String UNPUBLISHED_RECORDING_EVENT = "unpublished_recording_event";
	public static final String VERSION = "0.0.1";

	public final String recordId;

	public UnpublishedRecordingMessage(String recordId) {
		this.recordId = recordId;
	}
}
