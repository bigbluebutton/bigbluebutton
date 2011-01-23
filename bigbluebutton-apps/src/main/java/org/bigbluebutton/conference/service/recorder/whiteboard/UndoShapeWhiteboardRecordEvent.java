package org.bigbluebutton.conference.service.recorder.whiteboard;

public class UndoShapeWhiteboardRecordEvent extends
		AbstractWhiteboardRecordEvent {
	/**
	 * Hardcodes the Event Name to "UndoShapeEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "UndoShapeEvent");
	}
}
