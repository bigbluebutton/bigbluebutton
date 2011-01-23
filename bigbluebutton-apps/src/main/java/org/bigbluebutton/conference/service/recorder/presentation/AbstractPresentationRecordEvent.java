package org.bigbluebutton.conference.service.recorder.presentation;

import org.bigbluebutton.conference.service.recorder.RecordEvent;

public abstract class AbstractPresentationRecordEvent extends RecordEvent {
	/**
	 * Hardcodes the module name to "PRESENTATION"
	 * Calling this method will not have any effect.
	 */
	@Override
	public final void setModule(String module) {
		eventMap.put(MODULE, "PRESENTATION");
	}
	
}
