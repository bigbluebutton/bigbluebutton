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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.red5.logging.Red5LoggerFactory;

import org.red5.server.api.Red5;

import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;import org.bigbluebutton.conference.Participant;

public class ParticipantsService {

	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsService.class, "bigbluebutton" );	
	private ParticipantsApplication application;

	@SuppressWarnings("unchecked")
	public Map getParticipants() {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		log.debug("getting participants for {}",roomName);
		Map p = application.getParticipants(roomName);
		log.debug("getting participants for {}",roomName);
		Map participants = new HashMap();
		if (p == null) {
			participants.put("count", 0);
			log.debug("partipants of {} is null",roomName);
		} else {		
			
			participants.put("count", p.size());
			log.debug("number of partipants is {}",p.size());
			if (p.size() > 0) {
				/**
				 * Somehow we need to convert to Map so the client will be
				 * able to decode it. Need to figure out if we can send Participant
				 * directly. (ralam - 2/20/2009)
				 */
				Collection pc = p.values();
	    		Map pm = new HashMap();
	    		for (Iterator it = pc.iterator(); it.hasNext();) {
	    			Participant ap = (Participant) it.next();
	    			pm.put(ap.getUserid(), ap.toMap()); 
	    		}  
				participants.put("participants", pm);
			}			
		}
		return participants;
	}
	
	public void setParticipantStatus(Long userid, String status, Object value) {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		log.debug("Setting participant status "+roomName+" "+userid+" "+status+" "+value);
		application.setParticipantStatus(roomName, userid, status, value);
	}
	
	public void setParticipantsApplication(ParticipantsApplication a) {
		log.debug("Setting Participants Applications");
		application = a;
	}
}
