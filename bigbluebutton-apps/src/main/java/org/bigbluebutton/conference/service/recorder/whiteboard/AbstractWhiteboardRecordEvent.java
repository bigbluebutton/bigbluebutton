package org.bigbluebutton.conference.service.recorder.whiteboard;

import org.bigbluebutton.conference.service.recorder.RecordEvent;

public abstract class AbstractWhiteboardRecordEvent extends RecordEvent {
	
	public AbstractWhiteboardRecordEvent() {
		setModule("WHITEBOARD");
	}

	public void setPresentation(String name) {
		eventMap.put("presentation", name);
	}
	
	public void setPageNumber(int page) {
		eventMap.put("pageNumber", Integer.toString(page));
	}
}
