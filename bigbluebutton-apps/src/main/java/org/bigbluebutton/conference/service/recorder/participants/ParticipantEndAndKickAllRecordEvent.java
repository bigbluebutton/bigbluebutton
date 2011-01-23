package org.bigbluebutton.conference.service.recorder.participants;

public class ParticipantEndAndKickAllRecordEvent extends AbstractParticipantRecordEvent {

	/**
	 * Hardcodes the Event Name to "EndAndKickAllEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "EndAndKickAllEvent");
	}
}
