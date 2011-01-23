package org.bigbluebutton.conference.service.recorder.participants;

public class ParticipantStatusChangeRecordEvent extends AbstractParticipantRecordEvent {
	/**
	 * Hardcodes the Event Name to "ParticipantStatusChangeEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "ParticipantStatusChangeEvent");
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
