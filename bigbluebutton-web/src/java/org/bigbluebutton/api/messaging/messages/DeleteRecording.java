package org.bigbluebutton.api.messaging.messages;

public class DeleteRecording implements IMessage {

	public final String meetingID;
	public final String recordingID;
	
	public DeleteRecording(String meetingID, String recordingID) {
		this.meetingID = meetingID;
		this.recordingID = recordingID;
	}
}
