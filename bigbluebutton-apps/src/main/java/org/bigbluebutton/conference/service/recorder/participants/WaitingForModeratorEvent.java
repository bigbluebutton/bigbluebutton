package org.bigbluebutton.conference.service.recorder.participants;

public class WaitingForModeratorEvent extends AbstractParticipantRecordEvent {
	
	public WaitingForModeratorEvent() {
		super();
		setEvent("WaitingForModeratorEvent");
	}
	
	public void setUserId(String userId) {
		eventMap.put("userId", userId);
	}
	public void setArg(String arg) {
		eventMap.put("userId_userName", arg);
	}
	
}
