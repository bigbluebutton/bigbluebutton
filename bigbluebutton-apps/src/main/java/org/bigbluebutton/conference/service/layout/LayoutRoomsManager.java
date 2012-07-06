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
package org.bigbluebutton.conference.service.layout;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import net.jcip.annotations.ThreadSafe;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
/**
 * This encapsulates access to LayoutRoom and messages. This class must be threadsafe.
 */
@ThreadSafe
public class LayoutRoomsManager {
	private static Logger log = Red5LoggerFactory.getLogger( LayoutRoomsManager.class, "bigbluebutton" );
	
	private final Map <String, LayoutRoom> rooms;
	
	public LayoutRoomsManager() {
		log.debug("In LayoutRoomsManager constructor");	
		rooms = new ConcurrentHashMap<String, LayoutRoom>();
	}
	
	public void addRoom(LayoutRoom room) {
		log.debug("In LayoutRoomsManager adding room " + room.getName());
		rooms.put(room.getName(), room);
	}
	
	public void removeRoom(String name) {
		log.debug("In LayoutRoomsManager remove room " + name);
		rooms.remove(name);
	}
		
	public boolean hasRoom(String name) {
		log.debug("In LayoutRoomsManager has Room " + name);
		return rooms.containsKey(name);
	}
	
	
	/**
	 * Keeping getRoom private so that all access to ChatRoom goes through here.
	 */
	private LayoutRoom getRoom(String name) {
		log.debug("In LayoutRoomsManager get room " + name);
		return rooms.get(name);
	}
	
	public void addRoomListener(String roomName, ILayoutRoomListener listener) {
		LayoutRoom r = getRoom(roomName);
		if (r != null) {
			r.addRoomListener(listener);
			return;
		}
		log.warn("Adding listener to a non-existing room " + roomName);
	}
	
	public void removeRoomListener(String roomName, ILayoutRoomListener listener) {
		LayoutRoom r = getRoom(roomName);
		if (r != null) {
			r.removeRoomListener(listener);
			return;
		}	
		log.warn("Removing listener to a non-existing room " + roomName);
	}
	
	public void lockLayout(String room, int userId, String layout) {
		LayoutRoom r = getRoom(room);
		if (r != null) {
			r.lockLayout(userId, layout);
		} else {
			log.warn("lockLayout: sending message to a non-existing room " + room);
		}
	} 

	public void unlockLayout(String room) {
		LayoutRoom r = getRoom(room);
		if (r != null) {
			r.unlockLayout();
		} else {
			log.warn("unlockLayout: sending message to a non-existing room " + room);
		}
	}

	public List<Object> currentLayout(String room) {
		LayoutRoom r = getRoom(room);
		if (r != null) {
			return r.currentLayout();
		} else {
			log.warn("initLayout: sending message to a non-existing room " + room);
			return null;
		}
	}
}
