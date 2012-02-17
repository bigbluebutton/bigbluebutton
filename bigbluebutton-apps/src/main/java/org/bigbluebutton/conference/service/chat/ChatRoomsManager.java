/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
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
*/
package org.bigbluebutton.conference.service.chat;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import net.jcip.annotations.ThreadSafe;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
/**
 * This encapsulates access to ChatRoom and messages. This class must be threadsafe.
 */
@ThreadSafe
public class ChatRoomsManager {
	private static Logger log = Red5LoggerFactory.getLogger( ChatRoomsManager.class, "bigbluebutton" );
	
	private final Map <String, ChatRoom> rooms;
	
	public ChatRoomsManager() {
		log.debug("In ChatRoomsManager constructor");	
		rooms = new ConcurrentHashMap<String, ChatRoom>();
	}
	
	public void addRoom(ChatRoom room) {
		log.debug("In ChatRoomsManager adding room " + room.getName());
		rooms.put(room.getName(), room);
	}
	
	public void removeRoom(String name) {
		log.debug("In ChatRoomsManager remove room " + name);
		rooms.remove(name);
	}
		
	public boolean hasRoom(String name) {
		log.debug("In ChatRoomsManager has Room " + name);
		return rooms.containsKey(name);
	}
	
	
	/**
	 * Keeping getRoom private so that all access to ChatRoom goes through here.
	 */
	private ChatRoom getRoom(String name) {
		log.debug("In ChatRoomsManager get room " + name);
		return rooms.get(name);
	}
	
	public List<ChatObject> getChatMessages(String room) {
		ChatRoom r = getRoom(room);
		if (r != null) {
			return r.getChatMessages();
		}
		log.warn("Getting messages from a non-existing room " + room);
		return null;
	}
	
	public void sendMessage(String room, ChatObject chatobj) {
		ChatRoom r = getRoom(room);
		if (r != null) {
			r.sendMessage(chatobj);
		} else {
			log.warn("Sending message to a non-existing room " + room);
		}
	} 
	
	public void addRoomListener(String roomName, IChatRoomListener listener) {
		ChatRoom r = getRoom(roomName);
		if (r != null) {
			r.addRoomListener(listener);
			return;
		}
		log.warn("Adding listener to a non-existing room " + roomName);
	}
	
	//TODO: roomName?	
//	public void removeRoomListener(IChatRoomListener listener) {
//		ChatRoom r = getRoom(roomName);
//		if (r != null) {
//			r.removeRoomListener(listener);
//			return;
//		}	
//		log.warn("Removing listener from a non-existing room ${roomName}");
//	}
	
}
