package org.bigbluebutton.api.messaging.converters.messages;

public class PublishRecordingMessage {
	public static final String PUBLISH_RECORDING                 = "publish_recording";
	public final String VERSION = "0.0.1";
	
	public final String meetingID;
	public final String recordingID;
	
	public PublishRecordingMessage(String meetingID, String recordingID) {
		this.meetingID = meetingID;
		this.recordingID = recordingID;
	}
}
