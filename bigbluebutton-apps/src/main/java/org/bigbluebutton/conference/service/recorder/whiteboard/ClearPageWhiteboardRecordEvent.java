package org.bigbluebutton.conference.service.recorder.whiteboard;

public class ClearPageWhiteboardRecordEvent extends
		AbstractWhiteboardRecordEvent {
	
	public ClearPageWhiteboardRecordEvent() {
		super();
		setEvent("ClearPageEvent");
	}
}
