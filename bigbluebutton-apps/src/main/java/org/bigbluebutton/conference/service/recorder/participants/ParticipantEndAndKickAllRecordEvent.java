package org.bigbluebutton.conference.service.recorder.participants;

public class ParticipantEndAndKickAllRecordEvent extends AbstractParticipantRecordEvent {

	public ParticipantEndAndKickAllRecordEvent() {
		super();
		setEvent("EndAndKickAllEvent");
	}
}
