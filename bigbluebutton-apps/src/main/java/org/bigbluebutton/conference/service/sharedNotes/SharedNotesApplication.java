/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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
* Author: Felipe Cecagno <felipe@mconf.org>
*/
package org.bigbluebutton.conference.service.sharedNotes;

import java.util.List;
import java.util.Map;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class SharedNotesApplication {

	private static Logger log = Red5LoggerFactory.getLogger( SharedNotesApplication.class, "bigbluebutton" );	

	private SharedNotesRoomsManager roomsManager;
	public SharedNotesHandler handler;

	public boolean createRoom(String name) {
		roomsManager.addRoom(new SharedNotesRoom(name));
		return true;
	}

	public boolean destroyRoom(String name) {
		if (roomsManager.hasRoom(name)) {
			roomsManager.removeRoom(name);
		}
		return true;
	}

	public boolean hasRoom(String name) {
		return roomsManager.hasRoom(name);
	}

	public boolean addRoomListener(String room, ISharedNotesRoomListener listener) {
		if (roomsManager.hasRoom(room)){
			roomsManager.addRoomListener(room, listener);
			return true;
		}
		log.warn("Adding listener to a non-existant room " + room);
		return false;
	}

	public boolean addRoomClient(String room, String userid) {
		if (roomsManager.hasRoom(room)){
			roomsManager.addRoomClient(room, userid);
			return true;
		}
		log.warn("Adding client to a non-existant room " + room);
		return false;
	}
	public boolean removeRoomClient(String room, String userid) {
		if (roomsManager.hasRoom(room)){
			roomsManager.removeRoomClient(room, userid);
			return true;
		}
		log.warn("Removing client to a non-existant room " + room);
		return false;
	}

	public void setRoomsManager(SharedNotesRoomsManager r) {
		log.debug("Setting room manager");
		roomsManager = r;
	}

	public void patchDocument(String room, String noteId, String userId, String patch, Integer beginIndex, Integer endIndex) {
		roomsManager.patchDocument(room, noteId, userId, patch, beginIndex, endIndex);
	}

	public Map<String,String> currentDocument(String roomName, String userid) {
		return roomsManager.currentDocument(roomName, userid);
	}

	public void createAdditionalNotes(String room) {
		roomsManager.createAdditionalNotes(room);
	}

	public void destroyAdditionalNotes(String room, String notesId) {
		roomsManager.destroyAdditionalNotes(room, notesId);
	}

	public void createAdditionalNotesSet(String room, Integer additionalNotesSetSize) {
		roomsManager.createAdditionalNotesSet(room, additionalNotesSetSize);
	}
}
