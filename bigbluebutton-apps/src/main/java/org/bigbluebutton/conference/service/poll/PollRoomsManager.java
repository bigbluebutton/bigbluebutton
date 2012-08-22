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
package org.bigbluebutton.conference.service.poll;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import net.jcip.annotations.ThreadSafe;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * This encapsulates access to PollRoom and messages. This class must be threadsafe.
 */
@ThreadSafe
public class PollRoomsManager {
	private static Logger log = Red5LoggerFactory.getLogger( PollRoomsManager.class, "bigbluebutton" );
	
	private final Map <String, PollRoom> rooms;
	
	public PollRoomsManager() {
		rooms = new ConcurrentHashMap<String, PollRoom>();
	}
	
	public void addRoom(PollRoom room) {
		rooms.put(room.getName(), room);
	}
	
	public void removeRoom(String name) {
		rooms.remove(name);
	}
		
	public boolean hasRoom(String name) {

		return rooms.containsKey(name);
	}
	
	
	/**
	 * Keeping getRoom private so that all access to PollRoom goes through here.
	 */
	private  PollRoom getRoom(String name) {
		return rooms.get(name);
	}
	
	public void savePoll(Poll poll) {
		String room = poll.room;
		PollRoom r = getRoom(room);
		if (r != null) {
			r.savePoll(poll);
		} else {
			log.warn("Sending message to a non-existing room " + poll.room);
		}
	} 
	
	public void addRoomListener(String roomName, IPollRoomListener listener) {
		PollRoom r = getRoom(roomName);
		if (r != null) {
			r.addRoomListener(listener);
			return;
		}
		log.warn("Adding listener to a non-existing room " + roomName);
	}
}
