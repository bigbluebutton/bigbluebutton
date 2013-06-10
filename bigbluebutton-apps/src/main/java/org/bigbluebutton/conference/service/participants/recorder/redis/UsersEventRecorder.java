package org.bigbluebutton.conference.service.participants.recorder.redis;

import java.util.ArrayList;

import org.bigbluebutton.conference.User;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.bigbluebutton.conference.service.recorder.participants.AssignPresenterRecordEvent;
import org.bigbluebutton.conference.service.recorder.participants.ParticipantEndAndKickAllRecordEvent;
import org.bigbluebutton.conference.service.recorder.participants.ParticipantJoinRecordEvent;
import org.bigbluebutton.conference.service.recorder.participants.ParticipantLeftRecordEvent;
import org.bigbluebutton.conference.service.recorder.participants.ParticipantStatusChangeRecordEvent;

public class UsersEventRecorder {
	private RecorderApplication recorder;
	
	public void endAndKickAll(String meetingID) {
		ParticipantEndAndKickAllRecordEvent ev = new ParticipantEndAndKickAllRecordEvent();
		ev.setTimestamp(System.currentTimeMillis());
		ev.setMeetingId(meetingID);
		recorder.record(meetingID, ev);		
	}

	public void userJoined(String meetingID, User p) {
		ParticipantJoinRecordEvent ev = new ParticipantJoinRecordEvent();
		ev.setTimestamp(System.currentTimeMillis());
		ev.setUserId(p.getInternalUserID());
		ev.setName(p.getName());
		ev.setMeetingId(meetingID);
		ev.setStatus(p.getStatus().toString());
		ev.setRole(p.getRole());

		recorder.record(meetingID, ev);
	}

	public void userLeft(String meetingID, User p) {
		ParticipantLeftRecordEvent ev = new ParticipantLeftRecordEvent();
		ev.setTimestamp(System.currentTimeMillis());
		ev.setUserId(p.getInternalUserID());
		ev.setMeetingId(meetingID);
		
		recorder.record(meetingID, ev);
	}

	public void userStatusChange(String meetingID, User p, String status, Object value) {
		ParticipantStatusChangeRecordEvent ev = new ParticipantStatusChangeRecordEvent();
		ev.setTimestamp(System.currentTimeMillis());
		ev.setUserId(p.getInternalUserID());
		ev.setMeetingId(meetingID);
		ev.setStatus(status);
		ev.setValue(value.toString());
		
		recorder.record(meetingID, ev);
	}

	public void assignPresenter(String meetingID, String newPresenterID, String newPresenterName, String assignedBy) {
		AssignPresenterRecordEvent event = new AssignPresenterRecordEvent();
		event.setMeetingId(meetingID);
		event.setTimestamp(System.currentTimeMillis());
		event.setUserId(newPresenterID);
		event.setName(newPresenterName);
		event.setAssignedBy(assignedBy);
		
		recorder.record(meetingID, event);
	}
}
