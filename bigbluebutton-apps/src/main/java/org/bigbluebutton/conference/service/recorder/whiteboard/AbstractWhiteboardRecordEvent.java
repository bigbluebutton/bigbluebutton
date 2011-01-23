package org.bigbluebutton.conference.service.recorder.whiteboard;

import org.bigbluebutton.conference.service.recorder.RecordEvent;

public abstract class AbstractWhiteboardRecordEvent extends RecordEvent {
	/**
	 * Hardcodes the module name to "WHITEBOARD"
	 * Calling this method will not have any effect.
	 */
	@Override
	public final void setModule(String module) {
		eventMap.put(MODULE, "WHITEBOARD");
	}

	public void setPresentation(String name) {
		eventMap.put("presentation", name);
	}
	
	public void setPageNumber(int page) {
		eventMap.put("pageNumber", Integer.toString(page));
	}
}
