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

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class LayoutApplication {

	private static Logger log = Red5LoggerFactory.getLogger( LayoutApplication.class, "bigbluebutton" );	
		
	private LayoutRoomsManager roomsManager;
	public LayoutHandler handler;
	
	public boolean createRoom(String name) {
		roomsManager.addRoom(new LayoutRoom(name));
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
	
	public boolean addRoomListener(String room, ILayoutRoomListener listener) {
		if (roomsManager.hasRoom(room)){
			roomsManager.addRoomListener(room, listener);
			return true;
		}
		log.warn("Adding listener to a non-existant room " + room);
		return false;
	}
	
	public void setRoomsManager(LayoutRoomsManager r) {
		log.debug("Setting room manager");
		roomsManager = r;
	}

	public void lockLayout(String room, int userId, String layout) {
		roomsManager.lockLayout(room, userId, layout);
	}

	public void unlockLayout(String room) {
		roomsManager.unlockLayout(room);
	}

	public List<Object> currentLayout(String roomName) {
		return roomsManager.currentLayout(roomName);
	}
}
