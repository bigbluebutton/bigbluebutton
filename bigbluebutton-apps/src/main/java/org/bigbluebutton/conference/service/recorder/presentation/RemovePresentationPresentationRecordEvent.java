package org.bigbluebutton.conference.service.recorder.presentation;

public class RemovePresentationPresentationRecordEvent extends
		AbstractPresentationRecordEvent {
	/**
	 * Hardcodes the Event Name to "RemovePresentationEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "RemovePresentationEvent");
	}
	
	public void setPresentationName(String name) {
		eventMap.put("presentationName", name);
	}
}
