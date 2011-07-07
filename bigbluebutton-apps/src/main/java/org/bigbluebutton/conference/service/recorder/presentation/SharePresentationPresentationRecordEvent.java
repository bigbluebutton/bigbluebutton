package org.bigbluebutton.conference.service.recorder.presentation;

public class SharePresentationPresentationRecordEvent extends
		AbstractPresentationRecordEvent {
	
	public SharePresentationPresentationRecordEvent() {
		super();
		setEvent("SharePresentationEvent");
	}
	
	public void setPresentationName(String name) {
		eventMap.put("presentationName", name);
	}
	
	public void setShare(boolean share) {
		eventMap.put("share", Boolean.toString(share));
	}
}
