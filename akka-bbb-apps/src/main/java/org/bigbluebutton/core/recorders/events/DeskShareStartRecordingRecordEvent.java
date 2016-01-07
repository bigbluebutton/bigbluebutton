package org.bigbluebutton.core.recorders.events;

public class DeskShareStartRecordingRecordEvent extends
		AbstractDeskShareRecordEvent {

	public DeskShareStartRecordingRecordEvent() {
		super();
		setEvent("DeskShareStartRecording");
	}

	public void setFilename(String filename) {
		eventMap.put("filename", filename);
	}
}
