package org.bigbluebutton.core.recorders.events;

public class DeskShareStopRTMPRecordEvent extends
		AbstractDeskShareRecordEvent {

	public DeskShareStopRTMPRecordEvent() {
		super();
		setEvent("DeskShareStopRTMP");
	}

	public void setStreamPath(String streamPath) {
		eventMap.put("streamPath", streamPath);
	}
}
