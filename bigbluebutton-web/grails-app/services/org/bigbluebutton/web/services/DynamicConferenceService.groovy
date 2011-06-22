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
import org.bigbluebutton.api.domain.Recording;
import org.bigbluebutton.api.MeetingService;
import org.apache.commons.codec.binary.Hex;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.StringUtils;


public class DynamicConferenceService {	
	boolean transactional = false
	def serviceEnabled = false
	
	/** See bigbluebutton.properties for default values **/
	def apiVersion;
	def securitySalt
	int minutesElapsedBeforeMeetingExpiration = 60
	int defaultMaxUsers = 20
	def defaultWelcomeMessage
	def defaultDialAccessNumber
	def testVoiceBridge
	def testConferenceMock
	def recordingDir
	def recordingFile
	def recordStatusDir
	def defaultLogoutUrl
	def defaultServerUrl
	def defaultNumDigitsForTelVoice
	def defaultClientUrl
	def defaultMeetingDuration
	
	MeetingService meetingService
	RecordingService recordingService
		
	public Collection<Meeting> getAllMeetings() {
		return meetingService.getMeetings()
	}
	
	public void createMeeting(Meeting meeting) {
		meetingService.storeMeeting(meeting);
	}

	public Meeting getMeeting(String meetingId) {
		return meetingService.getMeeting(meetingId);
	}
	
	public void endMeetingRequest(String meetingId) {
		meetingService.endMeeting(meetingId);
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
		Meeting room = meetingService.getMeeting(meetingId)
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
	
		File doneFile = new File(done)
		if (!doneFile.exists()) {
			doneFile.createNewFile()
			if (!doneFile.exists())
				log.error("Failed to create " + done + " file.")
		} else {
			log.error(done + " file already exists.")
		}
	}	

	public boolean isValidMeetingId(String name) {
		return name ==~ /[0-9a-zA-Z_-]+/
	}
	
	public String convertToInternalMeetingId(extMeetingId) {
		return DigestUtils.shaHex(extMeetingId);
	}

	public boolean hasChecksumAndQueryString(String checksum, String queryString) {
		return (! StringUtils.isEmpty(checksum) && StringUtils.isEmpty(queryString));
	}
	
	public String processPassword(String pass) {
		return StringUtils.isEmpty(pass) ? RandomStringUtils.randomAlphanumeric(8) : pass;
		return paramsService.processPassword(pass);
	}
	
	public String processTelVoice(String telNum) {
		return StringUtils.isEmpty(telNum) ? RandomStringUtils.randomNumeric(defaultNumDigitsForTelVoice) : telNum;
	}
		
	public String processDialNumber(String dial) {
		return StringUtils.isEmpty(dial) ? defaultDialAccessNumber : dial;	
	}
	
	public String processLogoutUrl(String logoutUrl) {
		if (StringUtils.isEmpty(logoutUrl)) {
	        if (StringUtils.isEmpty(defaultLogoutUrl)) {          
        		return defaultServerUrl;
        	} else {
        		return defaultLogoutUrl;
        	}	
		}
		
		return logoutUrl;
	}
	
	public boolean processRecordMeeting(String record) {
		boolean rec = false			
		if(! StringUtils.isEmpty(record)){
			try {
				rec = Boolean.parseBoolean(record)
			} catch(Exception ex){ 
				log.error("Failed to parse record parameter.")
				rec = false;
			}
		}
		
		return rec;
	}
		
	public int processMaxUser(String maxUsers) {
		int mUsers = -1;
		
		try {
			mUsers = Integer.parseInt(maxUsers);
		} catch(Exception ex) { 
			log.warn("Failed to parse maximum number of participants.");
			mUsers = defaultMaxUsers;
		}		
		
		return mUsers;
	}	

  public int processMeetingDuration(String duration) {
    int mDuration = -1;
    
    try {
      mDuration = Integer.parseInt(duration);
    } catch(Exception ex) { 
      log.warn("Failed to parse meeting duration.");
      mDuration = Integer.parseInt(defaultMeetingDuration);
    }   
    
    return mDuration;
  } 
  	
	public boolean isTestMeeting(String telVoice) {	
		return ((! StringUtils.isEmpty(telVoice)) && 
				(! StringUtils.isEmpty(testVoiceBridge)) && 
				(telVoice == testVoiceBridge));	
	}
		
	public String getIntMeetingIdForTestMeeting(String telVoice) {		
		if ((testVoiceBridge != null) && (telVoice == testVoiceBridge)) {
			if (StringUtils.isEmpty(testConferenceMock)) 
				return testConferenceMock
		} 
		
		return "";	
	}
	
	public Map<String, String> processMeetingInfo(HashMap<String, String> params) {
		Map<String, String> meetingInfo = new HashMap<String, String>();	
			
		params.keySet().each { p ->
			if (p.contains("meta")) {
				String[] m = metadata.split("_")
				if (m.length == 2) {
					meetingInfo.put(m[1], params.get(p))
				}				
			}
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
		String cs = DigestUtils.shaHex(apiCall + queryString + securitySalt);
		log.debug "our checksum: " + cs
		if (cs == null || cs.equals(checksum) == false) {
			log.info("checksumError: request did not pass the checksum security check")
			log.info("salt: ${securitySalt} checksum: ${cs} client: ${checksum} query: ${queryString}")
			return false;
		}
		log.debug("checksum ok: request passed the checksum security check")
		return true; 
	}
	
	/**
	 * Process the welcome message parameter.
	 **/
	public String processWelcomeMessage(String message, String dialNum, String telVoice, String meetingName) {
		String welcomeMessage = message
		if (StringUtils.isEmpty(message)) {
			welcomeMessage = defaultWelcomeMessage
		} else {
			def DIAL_NUM = /%%DIALNUM%%/
			def CONF_NUM = /%%CONFNUM%%/
			def CONF_NAME = /%%CONFNAME%%/	
			def keywordList = [DIAL_NUM, CONF_NUM, CONF_NAME];
			
			keywordList.each { keyword ->
				switch(keyword){
					case DIAL_NUM:
						welcomeMessage = welcomeMessage.replaceAll(DIAL_NUM, dialNum)						
						break
					case CONF_NUM:
						welcomeMessage = welcomeMessage.replaceAll(CONF_NUM, telVoice)
						break
					case CONF_NAME:
						welcomeMessage = welcomeMessage.replaceAll(CONF_NAME, meetingName)
						break
				}			  
			}
		}
		return 	welcomeMessage;
	}
	
	public ArrayList<Recording> getRecordings() {
	   return recordingService.getRecordings();
	}
			
	public void setMeetingService(MeetingService s) {
		meetingService = s;
	}
}
