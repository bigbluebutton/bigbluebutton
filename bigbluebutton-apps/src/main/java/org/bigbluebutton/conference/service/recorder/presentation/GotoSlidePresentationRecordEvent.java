package org.bigbluebutton.conference.service.recorder.presentation;

public class GotoSlidePresentationRecordEvent extends
		AbstractPresentationRecordEvent {
	/**
	 * Hardcodes the Event Name to "GotoSlideEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "GotoSlideEvent");
	}
	
	public void setSlide(int slide) {
		eventMap.put("slide", Integer.toString(slide));
	}
}
