/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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

package org.bigbluebutton.conference.service.participants;

import java.util.ArrayList;
import java.util.Hashtable;
import java.util.Map;
import org.bigbluebutton.conference.service.recorder.Recorder;
import org.bigbluebutton.conference.IRoomListener;
import org.bigbluebutton.conference.BigBlueButtonUtils;import org.red5.server.api.so.ISharedObject;
import org.bigbluebutton.conference.Participant;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

public class ParticipantsEventSender implements IRoomListener {

	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsEventSender.class, "bigbluebutton" );
	
	Recorder recorder;
	private ISharedObject so;	
	String name = "PARTICIPANT_EVENT_SENDER";
	
	private final String RECORD_EVENT_JOIN="join";
	private final String RECORD_EVENT_LEAVE="leave";
	private final String RECORD_EVENT_STATUS_CHANGE="status_change";
	private final String RECORD_EVENT_LEAVE_ALL="leave_all";
	
	
	public ParticipantsEventSender(ISharedObject so) {
		this.so = so; 
	}
	
	@SuppressWarnings({ "rawtypes" })
	@Override
	public void endAndKickAll() {
		so.sendMessage("logout", new ArrayList());
	}

	@SuppressWarnings("unchecked")
	@Override
	public void assignPresenter(ArrayList<String> presenter) {
		log.debug("calling assignPresenterCallback " + presenter.get(0) + ", " + presenter.get(1) + " " + presenter.get(2));
		so.sendMessage("assignPresenterCallback", presenter);
	}
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Override
	public void participantJoined(Participant p) {
		log.debug("A participant has joined " + p.getInternalUserID());
		ArrayList args = new ArrayList();
		args.add(p.toMap());
		log.debug("Sending participantJoined " + p.getExternalUserID() + " to client.");
		so.sendMessage("participantJoined", args);
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	public void participantLeft(Participant p) {
		ArrayList args = new ArrayList();
		args.add(p.getInternalUserID());
		so.sendMessage("participantLeft", args);
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	public void participantStatusChange(Participant p, String status, Object value) {
		log.debug("A participant's status has changed " + p.getInternalUserID() + " " + status + " " + value);
		ArrayList args = new ArrayList();
		args.add(p.getInternalUserID());
		args.add(status);
		args.add(value);
		so.sendMessage("participantStatusChange", args);
	}

	@Override
	public String getName() {
		// TODO Auto-generated method stub
		return name;
	}
}
