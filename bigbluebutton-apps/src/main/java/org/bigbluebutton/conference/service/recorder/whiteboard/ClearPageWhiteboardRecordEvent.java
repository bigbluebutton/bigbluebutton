package org.bigbluebutton.conference.service.recorder.whiteboard;

public class ClearPageWhiteboardRecordEvent extends
		AbstractWhiteboardRecordEvent {
	/**
	 * Hardcodes the Event Name to "ClearPageEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "ClearPageEvent");
	}
}
