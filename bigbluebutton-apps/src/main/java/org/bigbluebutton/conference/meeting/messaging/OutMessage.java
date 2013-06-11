package org.bigbluebutton.conference.meeting.messaging;

public abstract class OutMessage {
	private final String meetingID;
	private final Boolean recorded;
	
	public OutMessage(String meetingID, Boolean recorded) {
		this.meetingID = meetingID;
		this.recorded = recorded;
	}
	
	public String getMeetingID() {
		return meetingID;
	}
	
	public boolean isRecorded() {
		return recorded;
	}
}
