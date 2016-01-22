package org.bigbluebutton.api.messaging.converters.messages;

public class DeleteRecordingMessage {
	public static final String DELETE_RECORDING                 = "delete_recording";
	public final String VERSION = "0.0.1";
	
	public final String meetingID;
	public final String recordingID;
	
	public DeleteRecordingMessage(String meetingID, String recordingID) {
		this.meetingID = meetingID;
		this.recordingID = recordingID;
	}
}
