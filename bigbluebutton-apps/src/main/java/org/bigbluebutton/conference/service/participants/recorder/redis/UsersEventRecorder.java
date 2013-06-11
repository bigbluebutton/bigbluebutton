package org.bigbluebutton.conference.service.participants.recorder.redis;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;
import org.bigbluebutton.conference.meeting.messaging.OutMessageListener;
import org.bigbluebutton.conference.meeting.messaging.messages.EndAndKickAllMessage;
import org.bigbluebutton.conference.service.participants.messaging.messages.AssignPresenterMessage;
import org.bigbluebutton.conference.service.participants.messaging.messages.UserJoinedMessage;
import org.bigbluebutton.conference.service.participants.messaging.messages.UserLeftMessage;
import org.bigbluebutton.conference.service.participants.messaging.messages.UserStatusChangeMessage;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.bigbluebutton.conference.service.recorder.participants.AssignPresenterRecordEvent;
import org.bigbluebutton.conference.service.recorder.participants.ParticipantEndAndKickAllRecordEvent;
import org.bigbluebutton.conference.service.recorder.participants.ParticipantJoinRecordEvent;
import org.bigbluebutton.conference.service.recorder.participants.ParticipantLeftRecordEvent;
import org.bigbluebutton.conference.service.recorder.participants.ParticipantStatusChangeRecordEvent;

public class UsersEventRecorder implements OutMessageListener {
	private RecorderApplication recorder;

	@Override
	public void send(OutMessage msg) {
		if (msg instanceof EndAndKickAllMessage) {
			endAndKickAll((EndAndKickAllMessage) msg);
		} else if (msg instanceof AssignPresenterMessage) {
			assignPresenter((AssignPresenterMessage) msg);
		} else if (msg instanceof UserJoinedMessage) {
			userJoined((UserJoinedMessage) msg);
		} else if (msg instanceof UserLeftMessage) {
			userLeft((UserLeftMessage) msg);
		} else if (msg instanceof UserStatusChangeMessage) {
			userStatusChange((UserStatusChangeMessage) msg);
		}
		
	}
	
	public void endAndKickAll(EndAndKickAllMessage msg) {
		if (msg.isRecorded()) {
			ParticipantEndAndKickAllRecordEvent ev = new ParticipantEndAndKickAllRecordEvent();
			ev.setTimestamp(System.currentTimeMillis());
			ev.setMeetingId(msg.getMeetingID());
			recorder.record(msg.getMeetingID(), ev);					
		}
	}

	public void userJoined(UserJoinedMessage msg) {
		if (msg.isRecorded()) {
			ParticipantJoinRecordEvent ev = new ParticipantJoinRecordEvent();
			ev.setTimestamp(System.currentTimeMillis());
			ev.setUserId(msg.getUserID());
			ev.setName(msg.getName());
			ev.setMeetingId(msg.getMeetingID());
			ev.setStatus(msg.getStatus().toString());
			ev.setRole(msg.getRole());

			recorder.record(msg.getMeetingID(), ev);			
		}
	}

	public void userLeft(UserLeftMessage msg) {
		if (msg.isRecorded()) {
			ParticipantLeftRecordEvent ev = new ParticipantLeftRecordEvent();
			ev.setTimestamp(System.currentTimeMillis());
			ev.setUserId(msg.getUserID());
			ev.setMeetingId(msg.getMeetingID());
			
			recorder.record(msg.getMeetingID(), ev);			
		}

	}

	public void userStatusChange(UserStatusChangeMessage msg) {
		if (msg.isRecorded()) {
			ParticipantStatusChangeRecordEvent ev = new ParticipantStatusChangeRecordEvent();
			ev.setTimestamp(System.currentTimeMillis());
			ev.setUserId(msg.getUserID());
			ev.setMeetingId(msg.getMeetingID());
			ev.setStatus(msg.getStatus());
			ev.setValue(msg.getValue().toString());
			
			recorder.record(msg.getMeetingID(), ev);			
		}
	}

	public void assignPresenter(AssignPresenterMessage msg) {
		if (msg.isRecorded()) {
			AssignPresenterRecordEvent event = new AssignPresenterRecordEvent();
			event.setMeetingId(msg.getMeetingID());
			event.setTimestamp(System.currentTimeMillis());
			event.setUserId(msg.getNewPresenterID());
			event.setName(msg.getNewPresenterName());
			event.setAssignedBy(msg.getAssignedBy());
			
			recorder.record(msg.getMeetingID(), event);			
		}

	}
}
