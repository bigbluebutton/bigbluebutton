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
package org.bigbluebutton.conference.service.voice;
import java.util.ArrayList;
import java.util.HashMap;
import org.slf4j.Logger;import org.red5.server.api.Red5;import org.bigbluebutton.conference.BigBlueButtonSession;import org.bigbluebutton.conference.Constants;import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import org.red5.logging.Red5LoggerFactory;import java.util.ArrayList;import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.conference.BigBlueButtonSession;
import org.bigbluebutton.conference.Constants;
import org.bigbluebutton.webconference.voice.ConferenceService;
import org.bigbluebutton.webconference.voice.Participant;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

public class VoiceService {
	
	private static Logger log = Red5LoggerFactory.getLogger( VoiceService.class, "bigbluebutton" );
	
	private IBigBlueButtonInGW bbbInGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW inGW) {
		bbbInGW = inGW;
	}

	public void getMeetMeUsers() {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();		
		bbbInGW.getVoiceUsers(meetingID, requesterID);
	}

	/*
	private Map<Integer, Map> arrayListToMap(ArrayList<Participant> alp) {
		log.debug("Converting arraylist to Map " + alp.size());
		Map<Integer, Map> result = new HashMap();
		
		for (Participant p : alp) {
			Map<String, Object> pmap = new HashMap();
			pmap.put("participant", p.getId());
			pmap.put("name", p.getName());
			pmap.put("muted", p.isMuted());
			pmap.put("talking", p.isTalking());
			log.debug("[" + p.getId() + "," + p.getName() + "," + p.isMuted() + "," + p.isTalking() + "]");
			result.put(p.getId(), pmap);
		}
		
		return result;
	}
*/	
	
	public void muteAllUsers(boolean mute, List<Integer> dontMuteThese) {
		String conference = getBbbSession().getVoiceBridge();    	
    	log.debug("Mute all users in room[" + conference + "], dontLockThese list size = " + dontMuteThese.size());
    	conferenceService.muteAllBut(conference, mute, dontMuteThese);
	}
	
	public void muteAllUsers(boolean mute) {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();		
		bbbInGW.muteAllUsers(meetingID, requesterID, mute); 		
	}	
	
	public void isRoomMuted(){
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();		
		bbbInGW.isMeetingMuted(meetingID, requesterID); 	
	}
	
	public void muteUnmuteUser(String userid, Boolean mute) {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();		
		bbbInGW.muteUser(meetingID, requesterID, userid, mute); 
	}
	
	public void lockMuteUser(String userid, Boolean lock) { 	
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();		
		bbbInGW.lockUser(meetingID, requesterID, userid, lock); 
	}
	
	public void kickUSer(String userID) {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();		
		bbbInGW.ejectUser(meetingID, requesterID, userID); 	
		
	}
		
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
}
