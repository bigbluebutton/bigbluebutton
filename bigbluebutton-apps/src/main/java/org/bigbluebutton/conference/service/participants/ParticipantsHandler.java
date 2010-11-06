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

import org.red5.server.adapter.IApplication;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.red5.logging.Red5LoggerFactory;

import org.red5.server.api.so.ISharedObject;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.Red5;
import java.util.HashMap;
import java.util.Map;import org.bigbluebutton.conference.RoomsManager;
import org.bigbluebutton.conference.Room;import org.bigbluebutton.conference.Participant;import org.bigbluebutton.conference.RoomListener;import org.bigbluebutton.conference.BigBlueButtonSession;import org.bigbluebutton.conference.Constants;import org.bigbluebutton.conference.service.recorder.RecorderApplication;

public class ParticipantsHandler extends ApplicationAdapter implements IApplication{
	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsHandler.class, "bigbluebutton" );

	private static final String PARTICIPANTS = "PARTICIPANTS";
	private static final String PARTICIPANTS_SO = "participantsSO";   
	private static final String APP = "PARTICIPANTS";

	private ParticipantsApplication participantsApplication;
	private RecorderApplication recorderApplication;
	
	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		log.debug(APP+":appConnect");
		return true;
	}

	@Override
	public void appDisconnect(IConnection conn) {
		log.debug( APP+":appDisconnect");
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		log.debug( APP+":appJoin "+scope.getName());
		return true;
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
		log.debug(APP+":appLeave "+scope.getName());
	}

	@Override
	public boolean appStart(IScope scope) {
		log.debug(APP+":appStart "+scope.getName());
		return true;
	}

	@Override
	public void appStop(IScope scope) {
		log.debug(APP+":appStop "+scope.getName());
	}

	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		log.debug(APP+":roomConnect");
		
		log.debug("In live mode");
		ISharedObject so = getSharedObject(connection.getScope(), PARTICIPANTS_SO);
		
		//log.debug("Setting up recorder with recording {}", getBbbSession().getRecord())
		ParticipantsEventRecorder recorder = new ParticipantsEventRecorder(so, getBbbSession().getRecord());
		log.debug("adding event recorder to {}",connection.getScope().getName());
		recorderApplication.addEventRecorder(connection.getScope().getName(), recorder);				
		
		log.debug("Adding room listener");
		participantsApplication.addRoomListener(connection.getScope().getName(), recorder);
		log.debug("Done setting up recorder and listener");
		return true;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		log.debug(APP+":roomDisconnect");
	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		log.debug(APP+":roomJoin "+scope.getName()+" - "+scope.getParent().getName());
		participantJoin();
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
		log.debug(APP+":roomLeave "+scope.getName());
		BigBlueButtonSession bbbSession = getBbbSession();
		if (bbbSession == null) {
			log.debug("roomLeave - session is null"); 
		} else {
			log.debug("roomLeave - session is NOT null");
		}
		Long userid = bbbSession.getUserid();
		participantsApplication.participantLeft(bbbSession.getSessionName(), userid);
	}

	@Override
	public boolean roomStart(IScope scope) {
		log.debug(APP+" - roomStart "+scope.getName());
    	// create ParticipantSO if it is not already created
    	if (!hasSharedObject(scope, PARTICIPANTS_SO)) {
    		if (createSharedObject(scope, PARTICIPANTS_SO, false)) {    			
    			return true; 			
    		}    		
    	}  	
		log.error("Failed to start room {}",scope.getName());
    	return false;
	}

	@Override
	public void roomStop(IScope scope) {
		log.debug(APP+":roomStop "+scope.getName());
		if (!hasSharedObject(scope, PARTICIPANTS_SO)) {
    		clearSharedObjects(scope, PARTICIPANTS_SO);
    	}
	}
	
	@SuppressWarnings("unchecked")
	public boolean participantJoin() {
		log.debug(APP+":participantJoin - getting userid");
		BigBlueButtonSession bbbSession = getBbbSession();
		if (bbbSession == null) {
			log.warn("bbb session is null");
		}
		
		Long userid = bbbSession.getUserid();
		log.debug(APP+":participantJoin - userid "+userid);
		String username = bbbSession.getUsername();
		log.debug(APP+":participantJoin - username "+username);
		String role = bbbSession.getRole();
		log.debug(APP+":participantJoin - role "+role);
		String room = bbbSession.getRoom();
		log.debug(APP+":participantJoin - room "+room);
		
		String externUserID = bbbSession.getExternUserID();
		
		log.debug(APP+":participantJoin");
		Map status = new HashMap();
		status.put("raiseHand", false);
		status.put("presenter", false);
		status.put("hasStream", false);
		
		log.debug(APP+":participantJoin setting status");		
		return participantsApplication.participantJoin(room, userid, username, role, externUserID, status);
	}
	
	public void setParticipantsApplication(ParticipantsApplication a) {
		log.debug("Setting participants application");
		participantsApplication = a;
	}
	
	public void setRecorderApplication(RecorderApplication a) {
		log.debug("Setting recorder application");
		recorderApplication = a;
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
}
