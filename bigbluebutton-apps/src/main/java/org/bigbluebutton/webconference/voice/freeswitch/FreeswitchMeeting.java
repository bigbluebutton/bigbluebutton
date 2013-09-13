package org.bigbluebutton.webconference.voice.freeswitch;

public class FreeswitchMeeting {

	private final String meetingID;
	private final Integer voiceMeetingID;
	
	public FreeswitchMeeting(String meetingID, Integer voiceMeetingID) {
		this.meetingID = meetingID;
		this.voiceMeetingID = voiceMeetingID;
	}
	
	public String getMeetingID() {
		return meetingID;
	}
	
	public Integer getVoiceMeetingID() {
		return voiceMeetingID;
	}
}
