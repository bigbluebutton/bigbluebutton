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
import org.red5.logging.Red5LoggerFactory;
import java.util.Map;import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import org.bigbluebutton.conference.service.lock.LockSettingsOld;

public class ParticipantsApplication {
	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsApplication.class, "bigbluebutton" );	
	private IBigBlueButtonInGW bbbInGW;
				
	public void setParticipantStatus(String room, String userid, String status, Object value) {
		bbbInGW.setUserStatus(room, userid, status, value);
	}

	public boolean participantLeft(String roomName, String userid) {
		log.debug("Participant " + userid + " leaving room " + roomName);
		bbbInGW.userLeft(userid, userid);	
		return true;
	}
	
	public boolean participantJoin(String roomName, String userid, String username, String role, String externUserID, Map status) {
		bbbInGW.userJoin(roomName, userid, username, role, externUserID);
		return true;
			
/*
		log.debug("participant joining room " + roomName);
		if (roomsManager.hasRoom(roomName)) {
			Room room = roomsManager.getRoom(roomName);
			Boolean userLocked = false;
			
			LockSettings ls = room.getLockSettings();
			
			if(room.isLocked()) {
				//If room is locked and it's not a moderator, user join as locked
				if(!"MODERATOR".equals(role))
					userLocked = true;
				else {
					//If it's a moderator, check for lockSettings
					if(ls.getAllowModeratorLocking()) {
						userLocked = true;
					}
				}
			} 
			
			User p = new User(userid, username, role, externUserID, status, userLocked);			
			room.addParticipant(p);
			
			log.debug("participant joined room " + roomName);
			return true;
*/
	}
		
	public void assignPresenter(String room, String newPresenterID, String newPresenterName, String assignedBy){
		bbbInGW.assignPresenter(room, newPresenterID, newPresenterName, assignedBy);			
	}
	
	public void getUsers(String meetingID, String requesterID) {
		bbbInGW.getUsers(meetingID, requesterID);
	}
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW inGW) {
		bbbInGW = inGW;
	}
	
	public void setRecordingStatus(String meetingId, String userId, Boolean recording) {
		bbbInGW.setRecordingStatus(meetingId, userId, recording);
	}

	public void getRecordingStatus(String meetingId, String userId) {
		bbbInGW.getRecordingStatus(meetingId, userId);
	}
}
