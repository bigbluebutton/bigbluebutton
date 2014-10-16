package org.bigbluebutton.conference.service.recorder.participants;

public class GuestAskToEnterRecordEvent extends AbstractParticipantRecordEvent {
	
	public GuestAskToEnterRecordEvent() {
		super();
		setEvent("GuestAskToEnterEvent");
	}

	public void setUserId(String userId) {
		eventMap.put("userId", userId);
	}
	
	public void setName(String name) {
		eventMap.put("name", name);
	}
	
	
}
