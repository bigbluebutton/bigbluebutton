package org.bigbluebutton.conference.service.recorder.presentation;

public class SharePresentationPresentationRecordEvent extends
		AbstractPresentationRecordEvent {
	/**
	 * Hardcodes the Event Name to "SharePresentationEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "SharePresentationEvent");
	}
	
	public void setPresentationName(String name) {
		eventMap.put("presentationName", name);
	}
	
	public void setShare(boolean share) {
		eventMap.put("share", Boolean.toString(share));
	}
}
