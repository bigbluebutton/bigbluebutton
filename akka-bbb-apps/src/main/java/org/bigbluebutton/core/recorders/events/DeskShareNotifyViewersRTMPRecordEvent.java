package org.bigbluebutton.core.recorders.events;

public class DeskShareNotifyViewersRTMPRecordEvent extends
		AbstractDeskShareRecordEvent {

	public DeskShareNotifyViewersRTMPRecordEvent() {
		super();
		setEvent("DeskShareNotifyViewersRTMP");
	}

	public void setStreamPath(String streamPath) {
		eventMap.put("streamPath", streamPath);
	}

	public void setBroadcasting(Boolean broadcasting) {
		eventMap.put("broadcasting", broadcasting.toString());
	}

	public void setVideoWidth(int videoWidth) {
		eventMap.put("videoWidth", Integer.toString(videoWidth));
	}

	public void setVideoHeight(int videoHeight) {
		eventMap.put("videoHeight", Integer.toString(videoHeight));
	}
}
