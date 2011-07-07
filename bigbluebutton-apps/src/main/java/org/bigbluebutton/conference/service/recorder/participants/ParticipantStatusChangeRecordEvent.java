package org.bigbluebutton.conference.service.recorder.participants;

public class ParticipantStatusChangeRecordEvent extends AbstractParticipantRecordEvent {
	
	public ParticipantStatusChangeRecordEvent() {
		super();
		setEvent("ParticipantStatusChangeEvent");
	}

	public void setUserId(String userId) {
		eventMap.put("userId", userId);
	}
	
	public void setStatus(String status) {
		eventMap.put("status", status);
	}
	
	public void setValue(String value) {
		eventMap.put("value", value);
	}
}
