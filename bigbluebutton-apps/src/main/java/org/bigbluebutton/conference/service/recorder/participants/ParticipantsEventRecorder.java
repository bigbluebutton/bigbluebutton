package org.bigbluebutton.conference.service.recorder.participants;

import java.util.ArrayList;
import org.bigbluebutton.conference.IRoomListener;
import org.bigbluebutton.conference.Participant;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class ParticipantsEventRecorder implements IRoomListener {
	private static Logger log = Red5LoggerFactory.getLogger(ParticipantsEventRecorder.class, "bigbluebutton");
	private final RecorderApplication recorder;
	private final String session;
	
	String name = "RECORDER:PARTICIPANT";
		
	public ParticipantsEventRecorder(String session, RecorderApplication recorder) {
		this.recorder = recorder;
		this.session = session;
	}

	@Override
	public void endAndKickAll() {
		ParticipantEndAndKickAllRecordEvent ev = new ParticipantEndAndKickAllRecordEvent();
		ev.setTimestamp(System.currentTimeMillis());
		ev.setMeetingId(session);
		recorder.record(session, ev);		
	}

	@Override
	public void participantJoined(Participant p) {
		ParticipantJoinRecordEvent ev = new ParticipantJoinRecordEvent();
		ev.setTimestamp(System.currentTimeMillis());
		ev.setUserId(p.getInternalUserID().toString());
		ev.setMeetingId(session);
		ev.setStatus(p.getStatus().toString());
		ev.setRole(p.getRole());

		recorder.record(session, ev);
	}

	@Override
	public void participantLeft(Participant p) {
		ParticipantLeftRecordEvent ev = new ParticipantLeftRecordEvent();
		ev.setTimestamp(System.currentTimeMillis());
		ev.setUserId(p.getInternalUserID().toString());
		ev.setMeetingId(session);
		
		recorder.record(session, ev);
	}

	@Override
	public void participantStatusChange(Participant p, String status, Object value) {
		ParticipantStatusChangeRecordEvent ev = new ParticipantStatusChangeRecordEvent();
		ev.setTimestamp(System.currentTimeMillis());
		ev.setUserId(p.getInternalUserID().toString());
		ev.setMeetingId(session);
		ev.setStatus(status);
		ev.setValue(value.toString());
		
		recorder.record(session, ev);
	}

	@Override
	public void assignPresenter(ArrayList<String> presenter) {
		log.debug("RECORD module:presentation event:assign_presenter");
		AssignPresenterRecordEvent event = new AssignPresenterRecordEvent();
		event.setMeetingId(session);
		event.setTimestamp(System.currentTimeMillis());
		event.setUserId(presenter.get(0).toString());
		event.setName(presenter.get(1).toString());
		event.setAssignedBy(presenter.get(2).toString());
		
		recorder.record(session, event);
	}
	
	@Override
	public String getName() {
		return this.name;
	}

}
