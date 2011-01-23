package org.bigbluebutton.conference.service.recorder.participants;

public class ParticipantJoinRecordEvent extends AbstractParticipantRecordEvent {

	/**
	 * Hardcodes the Event Name to "ParticipantJoinEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "ParticipantJoinEvent");
	}
	
	public void setUserId(String userId) {
		eventMap.put("userId", userId);
	}
	
	/**
	 * Sets the role of the user as MODERATOR or VIEWER
	 * @param role
	 */
	public void setRole(String role) {
		eventMap.put("role", role);
	}
	
	public void setStatus(String status) {
		eventMap.put("status", status);
	}
}
