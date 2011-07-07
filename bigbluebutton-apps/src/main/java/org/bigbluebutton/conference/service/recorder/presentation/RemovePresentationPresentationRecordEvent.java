package org.bigbluebutton.conference.service.recorder.presentation;

public class RemovePresentationPresentationRecordEvent extends
		AbstractPresentationRecordEvent {
	
	public RemovePresentationPresentationRecordEvent() {
		super();
		setEvent("RemovePresentationEvent");
	}
	
	public void setPresentationName(String name) {
		eventMap.put("presentationName", name);
	}
}
