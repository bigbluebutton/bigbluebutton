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

package org.bigbluebutton.conference.service.participants;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import org.bigbluebutton.conference.User;

public class ParticipantsService {

	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsService.class, "bigbluebutton" );	
	private ParticipantsApplication application;

	@SuppressWarnings("unchecked")
	public void assignPresenter(String userid, String name, Long assignedBy) {
		log.info("Receive assignPresenter request from client [" + userid + "," + name + "," + assignedBy + "]");
		IScope scope = Red5.getConnectionLocal().getScope();
		ArrayList<String> presenter = new ArrayList<String>();
		presenter.add(userid);
		presenter.add(name);
		presenter.add(assignedBy.toString());
		ArrayList<String> curPresenter = application.getCurrentPresenter(scope.getName());
		application.setParticipantStatus(scope.getName(), userid, "presenter", true);
		
		if (curPresenter != null){ 
			String curUserid = (String) curPresenter.get(0);
			if (! curUserid.equals(userid)){
				log.info("Changing the current presenter [" + curPresenter.get(0) + "] to viewer.");
				application.setParticipantStatus(scope.getName(), curPresenter.get(0), "presenter", false);
			}
		} else {
			log.info("No current presenter. So do nothing.");
		}
		application.assignPresenter(scope.getName(), presenter);
	}
	
	@SuppressWarnings("unchecked")
	public Map getParticipants() {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		log.info("Client is requesting for list of participants in [" + roomName + "].");
		Map p = application.getParticipants(roomName);
		Map participants = new HashMap();
		if (p == null) {
			participants.put("count", 0);
			log.debug("partipants of " + roomName + " is null");
		} else {		
			
			participants.put("count", p.size());
			log.debug("number of partipants is " + p.size());
			if (p.size() > 0) {
				/**
				 * Somehow we need to convert to Map so the client will be
				 * able to decode it. Need to figure out if we can send Participant
				 * directly. (ralam - 2/20/2009)
				 */
				Collection pc = p.values();
	    		Map pm = new HashMap();
	    		for (Iterator it = pc.iterator(); it.hasNext();) {
	    			User ap = (User) it.next();
	    			pm.put(ap.getInternalUserID(), ap.toMap()); 
	    		}  
				participants.put("participants", pm);
			}			
		}
		return participants;
	}
	
	public void setParticipantStatus(String userid, String status, Object value) {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		log.debug("Setting participant status " + roomName + " " + userid + " " + status + " " + value);
		application.setParticipantStatus(roomName, userid, status, value);
	}
	
	public void setParticipantsApplication(ParticipantsApplication a) {
		log.debug("Setting Participants Applications");
		application = a;
	}

	public void askingToEnter(String userid) {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		application.askingToEnter(roomName, userid);
	}

	public String getGuestPolicy() {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		return application.getGuestPolicy(roomName);
	}	

	public void newGuestPolicy(String guestPolicy) {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		application.newGuestPolicy(roomName, guestPolicy);
	}

	public void askingForGuestWaiting(String userid) {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		application.askingForGuestWaiting(roomName, userid);
	}

	public void responseToAllGuests(Boolean resp) {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		application.responseToAllGuests(roomName, resp);
	}

	public void responseToGuest(String userid, Boolean resp) {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		application.responseToGuest(roomName, userid, resp);
	}
}
