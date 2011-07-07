package org.bigbluebutton.conference.service.recorder.participants;

public class ParticipantJoinRecordEvent extends AbstractParticipantRecordEvent {

	public ParticipantJoinRecordEvent() {
		super();
		setEvent("ParticipantJoinEvent");
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
