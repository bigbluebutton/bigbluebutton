package org.bigbluebutton.conference.service.recorder.participants;

public class GuestPolicyEvent extends AbstractParticipantRecordEvent {
	
	public GuestPolicyEvent() {
		super();
		setEvent("GuestPolicyEvent");
	}
	
	public void setPolicy(String guestPolicy) {
		eventMap.put("guestPolicy", guestPolicy);
	}
	
}
