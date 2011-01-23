package org.bigbluebutton.conference.service.recorder.presentation;

public class ConversionCompletedPresentationRecordEvent extends
		AbstractPresentationRecordEvent {
	/**
	 * Hardcodes the Event Name to "ConversionCompletedEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "ConversionCompletedEvent");
	}

	public void setPresentationName(String name) {
		eventMap.put("presentationName", name);
	}
	
	public void setSlidesInfo(String slidesInfo) {
		eventMap.put("slidesInfo", slidesInfo);
	}	
}
