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
package org.bigbluebutton.conference.service.voice
import org.slf4j.Loggerimport org.slf4j.LoggerFactoryimport org.red5.server.api.Red5import org.red5.server.api.IScopeimport org.bigbluebutton.conference.BigBlueButtonSessionimport org.bigbluebutton.conference.Constantsimport org.red5.logging.Red5LoggerFactory
import org.bigbluebutton.webconference.voice.ConferenceServiceimport java.util.ArrayListimport org.bigbluebutton.webconference.voice.Participant
public class VoiceService {
	
	private static Logger log = Red5LoggerFactory.getLogger( VoiceService.class, "bigbluebutton" );
	
	private ConferenceService conferenceService

	public Map<String, List> getMeetMeUsers() {
		def voiceBridge = getBbbSession().voiceBridge
		
    	log.debug("GetMeetmeUsers request for room[$voiceBridge]")
    	ArrayList<Participant> p = conferenceService.getParticipants(voiceBridge)

		Map participants = new HashMap()
		if (p == null) {
			participants.put("count", 0)
		} else {		
			participants.put("count", p.size())
			if (p.size() > 0) {				
				participants.put("participants", arrayListToMap(p))
			}			
		}
		log.info("MeetMe::service - Sending " + p.size() + " current users...");
		return participants
	}
	
	private Map<Integer, Map> arrayListToMap(ArrayList<Participant> alp) {
		log.debug("Converting arraylist to Map " + alp.size())
		Map<Integer, Map> result = new HashMap();
		
		for (Participant p : alp) {
			Map<String, Object> pmap = new HashMap();
			pmap.put('participant', p.id);
			pmap.put('name', p.name)
			pmap.put('muted', p.muted)
			pmap.put('talking', p.talking)
			log.debug("[$p.id,$p.name,$p.muted,$p.talking]")
			result.put(p.id, pmap)
		}
		
		return result
	}
	
	def muteAllUsers(mute) {
		def conference = getBbbSession().voiceBridge    	
    	log.debug("Mute all users in room[$conference]")
    	conferenceService.mute(conference, mute)	   	
	}	
	
	def muteUnmuteUser(userid, mute) {
		def conference = getBbbSession().voiceBridge    	
    	log.debug("MuteUnmute request for user [$userid] in room[$conference]")
    	conferenceService.mute(userid, conference, mute)
	}
	
	def kickUSer(userid) {
		def conference = getBbbSession().voiceBridge		
    	log.debug("KickUser $userid from $conference")		
		conferenceService.eject(userid, conference)
	}
	
	public void setConferenceService(ConferenceService s) {
		log.debug("Setting voice server")
		conferenceService = s
		log.debug("Setting voice server DONE")
	}
	
	private BigBlueButtonSession getBbbSession() {
		return Red5.connectionLocal.getAttribute(Constants.SESSION)
	}
}
