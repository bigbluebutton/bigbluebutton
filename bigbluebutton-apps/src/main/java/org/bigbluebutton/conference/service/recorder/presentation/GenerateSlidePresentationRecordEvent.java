package org.bigbluebutton.conference.service.recorder.presentation;

public class GenerateSlidePresentationRecordEvent extends
		AbstractPresentationRecordEvent {
	
	public GenerateSlidePresentationRecordEvent() {
		super();
		setEvent("GenerateSlideEvent");
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
