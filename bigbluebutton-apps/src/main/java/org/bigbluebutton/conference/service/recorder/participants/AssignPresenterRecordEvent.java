package org.bigbluebutton.conference.service.recorder.participants;

public class AssignPresenterRecordEvent extends AbstractParticipantRecordEvent {

	public AssignPresenterRecordEvent() {
		super();
		setEvent("AssignPresenterEvent");
	}
		
	public void setUserId(String userid) {
		eventMap.put("userid", userid);
	}
	
	public void setName(String name) {
		eventMap.put("name", name);
	}
	
	public void setAssignedBy(String by) {
		eventMap.put("assignedBy", by);
	}
}
