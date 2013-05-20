package org.bigbluebutton.core;

public class Meeting {
	private final String meetingID;
	
	public Meeting(String meetingID) {
		this.meetingID = meetingID;
	}
	
	public String getMeetingID() {
		return meetingID;
	}
}
