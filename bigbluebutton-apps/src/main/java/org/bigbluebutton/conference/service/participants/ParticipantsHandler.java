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
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.so.ISharedObject;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.Red5;
import java.util.HashMap;
import java.util.Map;import org.bigbluebutton.conference.BigBlueButtonSession;import org.bigbluebutton.conference.Constants;import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.bigbluebutton.conference.service.recorder.participants.ParticipantsEventRecorder;

public class ParticipantsHandler extends ApplicationAdapter implements IApplication{
	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsHandler.class, "bigbluebutton" );

	private static final String PARTICIPANTS_SO = "participantsSO";   
	private static final String APP = "PARTICIPANTS";

	private ParticipantsApplication participantsApplication;
	private RecorderApplication recorderApplication;
	
	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		log.debug(APP + ":appConnect");
		return true;
	}

	@Override
	public void appDisconnect(IConnection conn) {
		log.debug( APP + ":appDisconnect");
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		log.debug( APP + ":appJoin " + scope.getName());
		return true;
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
		log.debug(APP + ":appLeave " + scope.getName());
	}

	@Override
	public boolean appStart(IScope scope) {
		log.debug(APP + ":appStart " + scope.getName());
		return true;
	}

	@Override
	public void appStop(IScope scope) {
		log.debug(APP + ":appStop " + scope.getName());
	}

	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		log.debug(APP + ":roomConnect");
		
		ISharedObject so = getSharedObject(connection.getScope(), PARTICIPANTS_SO);
		ParticipantsEventSender sender = new ParticipantsEventSender(so);
		ParticipantsEventRecorder recorder = new ParticipantsEventRecorder(connection.getScope().getName(), recorderApplication);
		
		log.debug("Adding room listener " + connection.getScope().getName());
		participantsApplication.addRoomListener(connection.getScope().getName(), recorder);
		participantsApplication.addRoomListener(connection.getScope().getName(), sender);
		log.debug("Done setting up recorder and listener");
		
		return true;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		log.debug(APP + ":roomDisconnect");
	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		log.debug(APP + ":roomJoin " + scope.getName() + " - " + scope.getParent().getName());
		participantJoin();
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
		log.debug(APP + ":roomLeave " + scope.getName());
		BigBlueButtonSession bbbSession = getBbbSession();
		if (bbbSession == null) {
			log.debug("roomLeave - session is null"); 
		} else {
			participantsApplication.participantLeft(bbbSession.getSessionName(), bbbSession.getClientID());
		}		
	}
	
	@Override
	public boolean roomStart(IScope scope) {
		log.debug(APP + " - roomStart "+scope.getName());
    	// create ParticipantSO if it is not already created
    	if (!hasSharedObject(scope, PARTICIPANTS_SO)) {
    		if (createSharedObject(scope, PARTICIPANTS_SO, false)) {   
    			return true; 			
    		}    		
    	}  	
		log.error("Failed to start room " + scope.getName());
    	return false;
	}

	@Override
	public void roomStop(IScope scope) {
		log.debug(APP + ":roomStop " + scope.getName());
		if (!hasSharedObject(scope, PARTICIPANTS_SO)) {
    		clearSharedObjects(scope, PARTICIPANTS_SO);
    	}
	}
	
	public boolean participantJoin() {
		log.debug(APP + ":participantJoin - getting userid");
		BigBlueButtonSession bbbSession = getBbbSession();
		if (bbbSession != null) {
			Long userid = bbbSession.getClientID();
			String username = bbbSession.getUsername();
			String role = bbbSession.getRole();
			String room = bbbSession.getRoom();
			log.debug(APP + ":participantJoin - [" + room + "] [" + userid + ", " + username + ", " + role + "]");
			
			Map<String, Boolean> status = new HashMap<String, Boolean>();
			status.put("raiseHand", false);
			status.put("presenter", false);
			status.put("hasStream", false);	
			return participantsApplication.participantJoin(room, userid, username, role, bbbSession.getExternUserID(), status);
		}
		log.warn("Can't send user join as session is null.");
		return false;
	}
	
	public void setParticipantsApplication(ParticipantsApplication a) {
		participantsApplication = a;
	}
	
	public void setRecorderApplication(RecorderApplication a) {
		recorderApplication = a;
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
}
