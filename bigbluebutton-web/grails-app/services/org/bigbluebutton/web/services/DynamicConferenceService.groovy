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

import java.util.concurrent.ConcurrentHashMap
import java.util.*;
import java.util.concurrent.*;
import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.MeetingService;

public class DynamicConferenceService {	
	static transactional = false
	def serviceEnabled = false
	
	def apiVersion;
	def securitySalt
	int minutesElapsedBeforeMeetingExpiration = 60
	def defaultWelcomeMessage
	def defaultDialAccessNumber
	def testVoiceBridge
	def testConferenceMock
	def recordingDir
	def recordingFile
	def recordStatusDir

		
	public Collection<Meeting> getAllMeetings() {
		return confsByMtgID.isEmpty() ? Collections.emptySet() : Collections.unmodifiableCollection(confsByMtgID.values());
	}
	
	public void createConference(Meeting conf) {
		conf.setStoredTime(new Date());
		confsByMtgID.put(conf.getMeetingID(), conf);
		tokenMap.put(conf.getMeetingToken(), conf.getMeetingID());
		if (conf.isRecord()) {
			createConferenceRecord(conf);
		}
	}


	public Meeting getMeeting(String meetingID) {
		if (meetingID == null) {
			return null;
		}
		return confsByMtgID.get(meetingID);
	}
	
	private Meeting getConferenceByToken(String token) {
		if (token == null) {
			return null;
		}
		String mtgID = tokenMap.get(token);
		if (mtgID == null) {
			return null;
		}
		return confsByMtgID.get(mtgID);
	}
	
	public boolean isMeetingWithVoiceBridgeExist(String voiceBridge) {
		Collection<Meeting> confs = confsByMtgID.values()
		for (Meeting c : confs) {
	        if (voiceBridge == c.voiceBridge) {
	        	log.debug "Found voice bridge $voiceBridge"
	        	return true
	        }
		}
		log.debug "could not find voice bridge $voiceBridge"
		return false
	}
	
	public void processRecording(String meetingId) {
		System.out.println("enter processRecording " + meetingId)
		Meeting room = roomsByToken.get(meetingId)
		if (room != null) {
			System.out.println("Number of participants in room " + room.getNumberOfParticipants())
			if (room.getNumberOfParticipants() == 0) {
				System.out.println("starting processRecording " + meetingId)
				// Run conversion on another thread.
				new Timer().runAfter(1000) {
					startIngestAndProcessing(meetingId)
				}		
			} else {
				System.out.println("Someone still in the room...not processRecording " + meetingId)
			}
		} else {
			System.out.println("Could not find room " + meetingId + " ... Not processing recording")
		}
	}
	
	private void startIngestAndProcessing(meetingId) {	
		String done = recordStatusDir + "/" + meetingId + ".done"
		log.debug( "Writing done file " + done)
		File doneFile = new File(done)
		if (!doneFile.exists()) {
			doneFile.createNewFile()
			if (!doneFile.exists())
				log.error("Failed to create " + done + " file.")
		} else {
			log.error(done + " file already exists.")
		}
	}	

	public boolean isChecksumSame(String apiCall, String checksum, String queryString) {
		log.debug "checksum: " + checksum + "; query string: " + queryString
	
		if (StringUtils.isEmpty(securitySalt)) {
			log.warn "Security is disabled in this service. Make sure this is intentional."
			return true;
		}
		
		// handle either checksum as first or middle / end parameter
		// TODO: this is hackish - should be done better
		queryString = queryString.replace("&checksum=" + checksum, "")
		queryString = queryString.replace("checksum=" + checksum + "&", "")
		log.debug "query string after checksum removed: " + queryString
		String cs = DigestUtils.shaHex(apiCall + queryString + securitySalt());
		log.debug "our checksum: " + cs
		if (cs == null || cs.equals(checksum) == false) {
			log.info("checksumError: request did not pass the checksum security check")
			return false;
		}
		log.debug("checksum ok: request passed the checksum security check")
		return true; 
	}
	
	public void setMeetingService(MeetingService s) {
		meetingService = s;
	}
}
