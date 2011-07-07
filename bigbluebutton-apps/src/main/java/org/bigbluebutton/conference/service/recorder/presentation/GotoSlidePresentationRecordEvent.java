package org.bigbluebutton.conference.service.recorder.presentation;

public class GotoSlidePresentationRecordEvent extends
		AbstractPresentationRecordEvent {

	public GotoSlidePresentationRecordEvent() {
		super();
		setEvent("GotoSlideEvent");
	}
	
	public void setSlide(int slide) {
		eventMap.put("slide", Integer.toString(slide));
	}
}
