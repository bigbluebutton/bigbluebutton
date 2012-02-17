package org.bigbluebutton.conference.service.recorder.participants;

public class ParticipantLeftRecordEvent extends AbstractParticipantRecordEvent {
	
	public ParticipantLeftRecordEvent() {
		super();
		setEvent("ParticipantLeftEvent");
	}
	
	public void setUserId(String userId) {
		eventMap.put("userId", userId);
	}
	
}
