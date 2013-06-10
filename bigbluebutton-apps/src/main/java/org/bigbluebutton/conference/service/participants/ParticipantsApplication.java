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
import org.red5.logging.Red5LoggerFactory;import java.util.ArrayList;
import java.util.Map;
import org.bigbluebutton.conference.MeetingsManager;
import org.bigbluebutton.conference.Meeting;import org.bigbluebutton.conference.User;import org.bigbluebutton.conference.IRoomListener;

public class ParticipantsApplication {
	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsApplication.class, "bigbluebutton" );	

	private MeetingsManager roomsManager;
	
	public boolean createRoom(String meetingID, Boolean recorded) {
		if(!roomsManager.hasRoom(meetingID)){
			roomsManager.createMeeting(meetingID, recorded);
			return true;
		}
		return false;
	}
	
	public boolean destroyRoom(String name) {
		if (roomsManager.hasRoom(name)) {
			log.info("Destroying room " + name);
			roomsManager.removeRoom(name);
		} else {
			log.warn("Destroying non-existing room " + name);
		}
		return true;
	}
	
	public void destroyAllRooms() {
		roomsManager.destroyAllRooms();
	}
	
	public boolean hasRoom(String name) {
		return roomsManager.hasRoom(name);
	}
	
	public boolean addRoomListener(String room, IRoomListener listener) {
		if (roomsManager.hasRoom(room)){
			return true;
		}
		log.warn("Adding listener to a non-existant room " + room);
		return false;
	}
	
	public void setParticipantStatus(String room, String userid, String status, Object value) {
		roomsManager.changeParticipantStatus(room, userid, status, value);
	}
	
	public Map getParticipants(String roomName) {
		log.debug("getParticipants - " + roomName);
		if (! roomsManager.hasRoom(roomName)) {
			log.warn("Could not find room " + roomName + ". Total rooms " + roomsManager.numberOfRooms());
			return null;
		}

		return roomsManager.getParticipants(roomName);
	}
	
	public boolean participantLeft(String roomName, String userid) {
		log.debug("Participant " + userid + " leaving room " + roomName);
		if (roomsManager.hasRoom(roomName)) {
			Meeting room = roomsManager.getRoom(roomName);
			log.debug("Removing " + userid + " from room " + roomName);
			room.removeParticipant(userid);
			return true;
		}

		return false;
	}
	
	@SuppressWarnings("unchecked")
	public boolean participantJoin(String roomName, String userid, String username, String role, String externUserID, Map status) {
		log.debug("participant joining room " + roomName);
		if (roomsManager.hasRoom(roomName)) {
			User p = new User(userid, username, role, externUserID, status);			
			Meeting room = roomsManager.getRoom(roomName);
			room.addParticipant(p);
			log.debug("participant joined room " + roomName);
			return true;
		}
		log.debug("participant failed to join room " + roomName);
		return false;
	}
	
	public ArrayList<String> getCurrentPresenter(String room){
		if (roomsManager.hasRoom(room)){
			return roomsManager.getCurrentPresenter(room);			
		}
		log.warn("Getting presenter on a non-existant room " + room);
		return null;
	}
	
	public void assignPresenter(String room, String newPresenterID, String newPresenterName, String assignedBy){
		if (roomsManager.hasRoom(room)){
			roomsManager.assignPresenter(room, newPresenterID, newPresenterName, assignedBy);
			return;
		}
		log.warn("Assigning presenter on a non-existant room " + room);	
	}
	
	public void setRoomsManager(MeetingsManager r) {
		log.debug("Setting room manager");
		roomsManager = r;
	}
			
}
