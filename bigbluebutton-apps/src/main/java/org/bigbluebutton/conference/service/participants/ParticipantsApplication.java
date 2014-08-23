/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
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
import org.bigbluebutton.core.api.IBigBlueButtonInGW;

public class ParticipantsApplication {
	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsApplication.class, "bigbluebutton" );	
	private IBigBlueButtonInGW bbbInGW;

	public void userRaiseHand(String meetingId, String userId) {
		bbbInGW.userRaiseHand(meetingId, userId);
	}
	
	public void lowerHand(String meetingId, String userId, String loweredBy) {
		bbbInGW.lowerHand(meetingId, userId, loweredBy);
	}
	
	public void ejectUserFromMeeting(String meetingId, String userId, String ejectedBy) {
		bbbInGW.ejectUserFromMeeting(meetingId, userId, ejectedBy);
	}
	
	public void shareWebcam(String meetingId, String userId, String stream) {
		bbbInGW.shareWebcam(meetingId, userId, stream);		
	}
	
	public void unshareWebcam(String meetingId, String userId) {
		bbbInGW.unshareWebcam(meetingId, userId);
	}
	
	public void setParticipantStatus(String room, String userid, String status, Object value) {
		bbbInGW.setUserStatus(room, userid, status, value);
	}

	public boolean participantJoin(String roomName, String userid) { //is this used?!
		log.debug("Participant " + userid + " joining room " + roomName);
		bbbInGW.userJoin(roomName, userid);
		return true;
	}

	public boolean participantLeft(String roomName, String userid) { //is this used?!
		log.debug("Participant " + userid + " leaving room " + roomName);
		bbbInGW.userLeft(roomName, userid);
		return true;
	}

	public boolean registerUser(String roomName, String userid, String username, String role, String externUserID) {
		bbbInGW.registerUser(roomName, userid, username, role, externUserID, userid);
		return true;
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
