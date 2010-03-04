/* BigBlueButton - http://www.bigbluebutton.org
 * 
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
 * @author Jeremy Thomerson <jthomerson@genericconf.com>
 * @version $Id: $
 */
package org.bigbluebutton.web.services

import org.bigbluebutton.conference.Room
import java.util.concurrent.ConcurrentHashMap
import org.apache.commons.collections.bidimap.DualHashBidiMap
import java.util.Collection
import org.bigbluebutton.api.domain.DynamicConference;
 
public class DynamicConferenceService {	
	static transactional = false
	def serviceEnabled = false
	def securitySalt
	def defaultWelcomeMessage
	def defaultDialAccessNumber
	def testVoiceBridge
	def testConferenceMock
	
	// TODO: need to remove use of DynamicConference and make it use "Room.groovy" instead
	//				so that both apps and web are using common domain objects and we don't map between them
	private final Map<String, Room> roomsByToken
	private final Map<String, DynamicConference> confsByMtgID
	private final Map<String, String> tokenMap
	
	public DynamicConferenceService() {
		confsByMtgID = new ConcurrentHashMap<String, DynamicConference>()
		tokenMap = new DualHashBidiMap<String, String>()
		roomsByToken = new ConcurrentHashMap<String, Room>()
	}
	
	public void storeConference(DynamicConference conf) {
		confsByMtgID.put(conf.getMeetingID(), conf);
		tokenMap.put(conf.getMeetingToken(), conf.getMeetingID());
	}
	
	public Room getRoomByMeetingID(String meetingID) {
		if (meetingID == null) {
			return null;
		}
		String token = tokenMap.getKey(meetingID);
		if (token == null) {
			return null;
		}
		return roomsByToken.get(token);
	}
	
	public Room getRoomByToken(String token) {
		if (token == null) {
			return null;
		}
		return roomsByToken.get(token);
	}
	
	public DynamicConference getConferenceByMeetingID(String meetingID) {
		if (meetingID == null) {
			return null;
		}
		return confsByMtgID.get(meetingID);
	}
	
	public DynamicConference getConferenceByToken(String token) {
		if (token == null) {
			return null;
		}
		String mtgID = tokenMap.get(token);
		if (mtgID == null) {
			return null;
		}
		return confsByMtgID.get(mtgID);
	}
	
	public DynamicConference findConference(String token, String mtgID) {
		DynamicConference conf = getConferenceByToken(token);
		if (conf == null) {
			conf = getConferenceByMeetingID(mtgID);
		}
		return conf;
	}
	
	public Room findRoom(String token, String mtgID) {
		Room room = getRoomByToken(token);
		if (room == null) {
			room = getRoomByMeetingID(mtgID);
		}
		return room;
	}
	
	public boolean isMeetingWithVoiceBridgeExist(String voiceBridge) {
		Collection<DynamicConference> confs = confsByMtgID.values()
		for (DynamicConference c : confs) {
	        if (voiceBridge == c.voiceBridge) {
	        	log.debug "Found voice bridge $voiceBridge"
	        	return true
	        }
		}
		log.debug "could not find voice bridge $voiceBridge"
		return false
	}
	
	
	// these methods called by spring integration:
	public void conferenceStarted(Room room) {
		log.debug "conference started: " + room.getName();
		participantsUpdated(room);
		DynamicConference conf = getConferenceByToken(room.getName());
		if (conf != null) {
			conf.setStartTime(new Date());
			conf.setEndTime(null);
			log.debug "found conference and set start date"
		}
	}
	
	public void conferenceEnded(Room room) {
		log.debug "conference ended: " + room.getName();
		DynamicConference conf = getConferenceByToken(room.getName());
		if (conf != null) {
			conf.setEndTime(new Date());
			log.debug "found conference and set end date"
		}
	}
	
	public void participantsUpdated(Room room) {
		log.debug "participants updated: " + room.getName();
		roomsByToken.put(room.getName(), room);
	}
	// end of spring integration-called methods
	
}
