package org.bigbluebutton.deskshare;

public class CaptureEndEvent implements ICaptureEvent {

	private String room;

	public CaptureEndEvent(String room) {
		this.room = room;
	}
	
	public String getRoom() {
		return room;
	}
	
}
