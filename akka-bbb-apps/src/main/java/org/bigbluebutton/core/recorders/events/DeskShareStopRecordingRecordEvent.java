package org.bigbluebutton.core.recorders.events;

public class DeskShareStopRecordingRecordEvent extends
		AbstractDeskShareRecordEvent {

	public DeskShareStopRecordingRecordEvent() {
		super();
		setEvent("DeskShareStopRecording");
	}

	public void setFilename(String filename) {
		eventMap.put("filename", filename);
	}
}
