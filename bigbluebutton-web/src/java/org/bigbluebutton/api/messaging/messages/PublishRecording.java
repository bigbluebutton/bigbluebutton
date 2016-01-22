package org.bigbluebutton.api.messaging.messages;

public class PublishRecording implements IMessage {

	public final String meetingID;
	public final String recordingID;
	
	public PublishRecording(String meetingID, String recordingID) {
		this.meetingID = meetingID;
		this.recordingID = recordingID;
	}
}
