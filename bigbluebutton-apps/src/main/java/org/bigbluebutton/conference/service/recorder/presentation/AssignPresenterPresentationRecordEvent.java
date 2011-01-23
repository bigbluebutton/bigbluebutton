package org.bigbluebutton.conference.service.recorder.presentation;


public class AssignPresenterPresentationRecordEvent extends
		AbstractPresentationRecordEvent {
	
	public AssignPresenterPresentationRecordEvent() {
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
