package org.bigbluebutton.conference.service.recorder.presentation;

public class GenerateSlidePresentationRecordEvent extends
		AbstractPresentationRecordEvent {
	/**
	 * Hardcodes the Event Name to "GenerateSlideEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "GenerateSlideEvent");
	}
	
	public void setPresentationName(String name) {
		eventMap.put("presentationName", name);
	}
	
	public void setNumberOfPages(int numPages) {
		eventMap.put("numberOfPages", Integer.toString(numPages));
	}
	
	public void setPagesCompleted(int pagesCompleted) {
		eventMap.put("pagesCompleted", Integer.toString(pagesCompleted));
	}
}
