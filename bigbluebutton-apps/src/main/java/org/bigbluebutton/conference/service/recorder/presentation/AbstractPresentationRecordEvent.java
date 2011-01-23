package org.bigbluebutton.conference.service.recorder.presentation;

import org.bigbluebutton.conference.service.recorder.RecordEvent;

public abstract class AbstractPresentationRecordEvent extends RecordEvent {
	
	public AbstractPresentationRecordEvent() {
		setModule("PRESENTATION");
	}	
}
