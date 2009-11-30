/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */

package org.bigbluebutton.conference.service.participants

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

import org.red5.server.api.Red5import java.util.Mapimport org.bigbluebutton.conference.Participant
public class ParticipantsService {

	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsService.class, "bigbluebutton" );	
	private ParticipantsApplication application

	public Map getParticipants() {
		String roomName = Red5.connectionLocal.scope.name
		log.debug("getting participants for ${roomName}")
		Map p = application.getParticipants(roomName)
		log.debug("getting participants for ${roomName}")
		Map participants = new HashMap()
		if (p == null) {
			participants.put("count", 0)
		} else {		
			participants.put("count", p.size())
			if (p.size() > 0) {
				/**
				 * Somehow we need to convert to Map so the client will be
				 * able to decode it. Need to figure out if we can send Participant
				 * directly. (ralam - 2/20/2009)
				 */
				Collection pc = p.values()
	    		Map pm = new HashMap()
	    		for (Iterator it = pc.iterator(); it.hasNext();) {
	    			Participant ap = (Participant) it.next();
	    			pm.put(ap.userid, ap.toMap()); 
	    		}  
				participants.put("participants", pm)
			}			
		}
		return participants
	}
	
	def setParticipantStatus(def userid, def status, def value) {
		String roomName = Red5.connectionLocal.scope.name
		log.debug("Setting participant status $roomName $userid $status $value")
		application.setParticipantStatus(roomName, userid, status, value)
	}
	
	public void setParticipantsApplication(ParticipantsApplication a) {
		log.debug("Setting Participants Applications")
		application = a
	}
}
