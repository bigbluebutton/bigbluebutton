package org.bigbluebutton.conference.service.recorder.participants;

import org.bigbluebutton.conference.service.recorder.RecordEvent;

public abstract class AbstractParticipantRecordEvent extends RecordEvent {
	
	public AbstractParticipantRecordEvent() {
		setModule("PARTICIPANT");
	}
}
