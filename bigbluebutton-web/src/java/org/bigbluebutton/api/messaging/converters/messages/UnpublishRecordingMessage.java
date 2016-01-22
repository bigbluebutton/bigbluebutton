package org.bigbluebutton.api.messaging.converters.messages;

public class UnpublishRecordingMessage {
	public static final String UNPUBLISH_RECORDING                 = "unpublish_recording";
	public final String VERSION = "0.0.1";
	
	public final String meetingID;
	public final String recordingID;
	
	public UnpublishRecordingMessage(String meetingID, String recordingID) {
		this.meetingID = meetingID;
		this.recordingID = recordingID;
	}
}
