package org.bigbluebutton.api.messaging.messages;

public class UnpublishRecording implements IMessage {

	public final String meetingID;
	public final String recordingID;
	
	public UnpublishRecording(String meetingID, String recordingID) {
		this.meetingID = meetingID;
		this.recordingID = recordingID;
	}
}
