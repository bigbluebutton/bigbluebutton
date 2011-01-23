package org.bigbluebutton.conference.service.recorder.participants;

public class ParticipantLeftRecordEvent extends AbstractParticipantRecordEvent {
	/**
	 * Hardcodes the Event Name to "ParticipantLeftEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "ParticipantLeftEvent");
	}
	
	public void setUserId(String userId) {
		eventMap.put("userId", userId);
	}
	
}
