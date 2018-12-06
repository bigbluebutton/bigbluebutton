package org.bigbluebutton.api.messaging.converters.messages;

public class DeletedRecordingMessage {
	public static final String DELETED_RECORDING_EVENT = "deleted_recording_event";
	public static final String VERSION = "0.0.1";

	public final String recordId;

	public DeletedRecordingMessage(String recordId) {
		this.recordId = recordId;
	}
}
