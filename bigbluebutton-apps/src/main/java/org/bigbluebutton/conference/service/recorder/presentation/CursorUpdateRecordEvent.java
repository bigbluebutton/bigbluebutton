package org.bigbluebutton.conference.service.recorder.presentation;

public class CursorUpdateRecordEvent extends AbstractPresentationRecordEvent{
	
	public CursorUpdateRecordEvent() {
		super();
		setEvent("CursorMoveEvent");
	}
	
	public void setXPercent(double percent) {
		eventMap.put("xOffset", Double.toString(percent));
	}

	public void setYPercent(double percent) {
		eventMap.put("yOffset", Double.toString(percent));
	}

}
