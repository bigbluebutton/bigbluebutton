package org.bigbluebutton.conference.service.recorder.whiteboard;

public class ToggleGridWhiteboardRecordEvent extends
		AbstractWhiteboardRecordEvent {
	
	public ToggleGridWhiteboardRecordEvent() {
		super();
		setEvent("ToggleGridEvent");
	}
		
	public void setGridEnabled(boolean enabled) {
		eventMap.put("gridEnabled", Boolean.toString(enabled));
	}

}
