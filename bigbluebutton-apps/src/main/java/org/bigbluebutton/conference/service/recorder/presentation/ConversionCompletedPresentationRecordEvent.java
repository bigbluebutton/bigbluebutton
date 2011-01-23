package org.bigbluebutton.conference.service.recorder.presentation;

public class ConversionCompletedPresentationRecordEvent extends
		AbstractPresentationRecordEvent {
	
	public ConversionCompletedPresentationRecordEvent() {
		super();
		setEvent("ConversionCompletedEvent");
	}

	public void setPresentationName(String name) {
		eventMap.put("presentationName", name);
	}
	
	public void setSlidesInfo(String slidesInfo) {
		eventMap.put("slidesInfo", slidesInfo);
	}	
}
