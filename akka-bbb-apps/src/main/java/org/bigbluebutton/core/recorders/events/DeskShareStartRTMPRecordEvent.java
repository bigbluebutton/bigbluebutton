package org.bigbluebutton.core.recorders.events;

public class DeskShareStartRTMPRecordEvent extends
		AbstractDeskShareRecordEvent {

	public DeskShareStartRTMPRecordEvent() {
		super();
		setEvent("DeskShareStartRTMP");
	}

	public void setStreamPath(String streamPath) {
		eventMap.put("streamPath", streamPath);
	}
}
