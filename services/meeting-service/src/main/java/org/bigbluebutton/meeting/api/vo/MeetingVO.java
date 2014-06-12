package org.bigbluebutton.meeting.api.vo;

public class MeetingVO {

	public final String id;
	public final String name;
	
	public MeetingVO(String externalID, String name) {
		this.id = externalID;
		this.name = name;
	}
}
