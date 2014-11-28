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
* Author: Hugo Lazzari <hslazzari@gmail.com>
*/
package org.bigbluebutton.conference.service.sharedNotes;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import net.jcip.annotations.ThreadSafe;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
/**
* This encapsulates access to SharedNotesRoom and messages. This class must be threadsafe.
*/
@ThreadSafe
public class SharedNotesRoomsManager {
	private static Logger log = Red5LoggerFactory.getLogger( SharedNotesRoomsManager.class, "bigbluebutton" );

	private final Map <String, SharedNotesRoom> rooms;

	public SharedNotesRoomsManager() {
		log.debug("In SharedNotesRoomsManager constructor");	
		rooms = new ConcurrentHashMap<String, SharedNotesRoom>();
	}

	public void addRoom(SharedNotesRoom room) {
		log.debug("In SharedNotesRoomsManager adding room " + room.getName());
		rooms.put(room.getName(), room);
	}

	public void removeRoom(String name) {
		log.debug("In SharedNotesRoomsManager remove room " + name);
		rooms.remove(name);
	}

	public boolean hasRoom(String name) {
		log.debug("In SharedNotesRoomsManager has Room " + name);
		return rooms.containsKey(name);
	}


	/**
	* Keeping getRoom private so that all access to SharedNotesRoom goes through here.
	*/
	private SharedNotesRoom getRoom(String name) {
		log.debug("In SharedNotesRoomsManager get room " + name);
		return rooms.get(name);
	}

	public void addRoomListener(String roomName, ISharedNotesRoomListener listener) {
		SharedNotesRoom r = getRoom(roomName);
		if (r != null) {
			r.addRoomListener(listener);
			return;
		}
		log.warn("Adding listener to a non-existing room " + roomName);
	}


	public void addRoomClient(String roomName, String userid) {
		SharedNotesRoom r = getRoom(roomName);
		if (r != null) {
			r.addRoomClient(userid);
			return;
		}
		log.warn("Adding client to a non-existing room " + roomName);
	}

	public void removeRoomClient(String roomName, String userid) {
		SharedNotesRoom r = getRoom(roomName);
		if (r != null) {
			r.removeRoomClient(userid);
			return;
		}
		log.warn("Removing client to a non-existing room " + roomName);
	}

	public void removeRoomListener(String roomName, ISharedNotesRoomListener listener) {
		SharedNotesRoom r = getRoom(roomName);
		if (r != null) {
			r.removeRoomListener(listener);
			return;
		}	
		log.warn("Removing listener to a non-existing room " + roomName);
	}

	public void patchDocument(String room, String noteId, String userId, String patch, Integer beginIndex, Integer endIndex) {
		SharedNotesRoom r = getRoom(room);
		if (r != null) {
			r.patchDocument(noteId, userId, patch, beginIndex, endIndex);
		} else {
			log.warn("patchDocument: sending message to a non-existing room " + room);
		}
	}

	public Map<String,String> currentDocument(String room, String userid) {
		SharedNotesRoom r = getRoom(room);
		if (r != null) {
			return r.currentDocument(userid);
		} else {
			log.warn("initSharedNotes: sending message to a non-existing room " + room);
			return null;
		}
	}

	public void createAdditionalNotes(String room) {
		SharedNotesRoom r = getRoom(room);
		if (r != null) {
			r.createAdditionalNotes();
		} else {
			log.warn("createAdditionalNotes: sending message to a non-existing room " + room);
		}
	}

	public void destroyAdditionalNotes(String room, String notesId) {
		SharedNotesRoom r = getRoom(room);
		if (r != null) {
			r.destroyAdditionalNotes(notesId);
		} else {
			log.warn("destroyAdditionalNotes: sending message to a non-existing room " + room);
		}
	}

	public void createAdditionalNotesSet(String room, Integer additionalNotesSetSize) {
		SharedNotesRoom r = getRoom(room);
		if (r != null) {
			r.createAdditionalNotesSet(additionalNotesSetSize);
		} else {
			log.warn("createAdditionalNotesSet: sending message to a non-existing room " + room);
		}
	}
}
