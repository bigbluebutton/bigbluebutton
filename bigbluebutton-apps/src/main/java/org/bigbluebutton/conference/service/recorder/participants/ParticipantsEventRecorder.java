/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.conference.service.recorder.participants;

import java.util.ArrayList;
import java.util.Map;

import org.bigbluebutton.conference.IRoomListener;
import org.bigbluebutton.conference.User;
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
	public void participantJoined(User p) {
		ParticipantJoinRecordEvent ev = new ParticipantJoinRecordEvent();
		ev.setTimestamp(System.currentTimeMillis());
		ev.setUserId(p.getInternalUserID());
		ev.setName(p.getName());
		ev.setMeetingId(session);
		ev.setStatus(p.getStatus().toString());
		ev.setRole(p.getRole());

		recorder.record(session, ev);
	}

	@Override
	public void participantLeft(User p) {
		ParticipantLeftRecordEvent ev = new ParticipantLeftRecordEvent();
		ev.setTimestamp(System.currentTimeMillis());
		ev.setUserId(p.getInternalUserID());
		ev.setMeetingId(session);
		
		recorder.record(session, ev);
	}

	@Override
	public void participantStatusChange(User p, String status, Object value) {
		ParticipantStatusChangeRecordEvent ev = new ParticipantStatusChangeRecordEvent();
		ev.setTimestamp(System.currentTimeMillis());
		ev.setUserId(p.getInternalUserID());
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

	@Override
	public void lockSettingsChange(Map<String, Boolean> lockSettings) {
		
	}

}
