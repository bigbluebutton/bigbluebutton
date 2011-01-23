package org.bigbluebutton.conference.service.recorder.participants;

import org.bigbluebutton.conference.service.recorder.RecordEvent;

public abstract class AbstractParticipantRecordEvent extends RecordEvent {
	/**
	 * Hardcodes the module name to "PARTICIPANT"
	 * Calling this method will not have any effect.
	 */
	@Override
	public final void setModule(String module) {
		eventMap.put(MODULE, "PARTICIPANT");
	}
}
