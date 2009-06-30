/*
 * BigBlueButton - http://www.bigbluebutton.org
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
 * $Id: $
 */
package org.bigbluebutton.conference.service.chat

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

import net.jcip.annotations.ThreadSafe
import java.util.concurrent.ConcurrentHashMap
/**
 * This encapsulates access to ChatRoom and messages. This class must be threadsafe.
 */
@ThreadSafe
public class ChatRoomsManager {
	private static Logger log = Red5LoggerFactory.getLogger( ChatRoomsManager.class, "bigbluebutton" );
	
	private final Map <String, ChatRoom> rooms
	
	public ChatRoomsManager() {
		log.debug("In ChatRoomsManager constructor")	
		rooms = new ConcurrentHashMap<String, ChatRoom>()
	}
	
	public void addRoom(ChatRoom room) {
		log.debug("In RoomsManager adding room ${room.name}")
		rooms.put(room.name, room)
	}
	
	public void removeRoom(String name) {
		log.debug("In RoomsManager remove room ${name}")
		rooms.remove(name)
	}
		
	public boolean hasRoom(String name) {
		log.debug("In RoomsManager has Room ${name}")
		return ((HashMap)rooms).containsKey(name)
	}
	
	
	/**
	 * Keeping getRoom private so that all access to ChatRoom goes through here.
	 */
	private ChatRoom getRoom(String name) {
		log.debug("In RoomsManager get room ${name}")
		rooms.get(name)
	}
	
	public String getChatMessages(String room) {
		ChatRoom r = getRoom(room)
		if (r != null) {
			return r.getChatMessages()
		}
		log.warn("Getting messages from a non-existing room ${room}")
		return ""
	}
	
	public void sendMessage(String room, String message) {
		ChatRoom r = getRoom(room)
		if (r != null) {
			r.sendMessage(message)
		}
		log.warn("Sending message to a non-existing room ${room}")
	}
	
	public void addRoomListener(String roomName, IChatRoomListener listener) {
		ChatRoom r = getRoom(roomName)
		if (r != null) {
			r.addRoomListener(listener)
			return
		}
		log.warn("Adding listener to a non-existing room ${roomName}")
	}
	
	public void removeRoomListener(IChatRoomListener listener) {
		ChatRoom r = getRoom(roomName)
		if (r != null) {
			r.removeRoomListener(listener)
			return
		}	
		log.warn("Removing listener from a non-existing room ${roomName}")
	}
	
}
