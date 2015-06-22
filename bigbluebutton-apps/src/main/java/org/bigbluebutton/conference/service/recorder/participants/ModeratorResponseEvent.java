package org.bigbluebutton.conference.service.recorder.participants;

public class ModeratorResponseEvent extends AbstractParticipantRecordEvent {
	
	public ModeratorResponseEvent() {
		super();
		setEvent("ModeratorResponseEvent");
	}

	public void setUserId(String userId) {
		eventMap.put("userId", userId);
	}
	
	public void setResp(Boolean resp) {
		eventMap.put("resp", resp.toString());
	}
	
	
}
