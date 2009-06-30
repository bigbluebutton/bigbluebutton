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
package org.bigbluebutton.conference.service.voice

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import net.jcip.annotations.ThreadSafe
import java.util.concurrent.ConcurrentHashMapimport org.red5.logging.Red5LoggerFactory
/**
 * This encapsulates access to Room and messages. This class must be threadsafe.
 */
@ThreadSafe
public class VoiceRoomsManager {
	private static Logger log = Red5LoggerFactory.getLogger( VoiceRoomsManager.class, "bigbluebutton" );
	
	private final Map <String, VoiceRoom> rooms
	
	public VoiceRoomsManager() {
		log.debug("In VoiceRoomsManager constructor")	
		rooms = new ConcurrentHashMap<String, VoiceRoom>()
	}
	
	public void addRoom(VoiceRoom room) {
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
	
	public void setConference(String room, String conference) {
		VoiceRoom r = getRoom(room)
		if (r != null) {
			r.setConference(conference)
			return
		}
		log.warn("Setting conference to a non-existing room ${roomName}")
	}
	
	/**
	 * Keeping getRoom private so that all access to ChatRoom goes through here.
	 */
	private VoiceRoom getRoom(String name) {
		log.debug("In RoomsManager get room ${name}")
		rooms.get(name)
	}
	

	public void addRoomListener(String roomName, IVoiceRoomListener listener) {
		VoiceRoom r = getRoom(roomName)
		if (r != null) {
			r.addRoomListener(listener)
			return
		}
		log.warn("Adding listener to a non-existing room ${roomName}")
	}
	
	public void removeRoomListener(IVoiceRoomListener listener) {
		VoiceRoom r = getRoom(roomName)
		if (r != null) {
			r.removeRoomListener(listener)
			return
		}	
		log.warn("Removing listener from a non-existing room ${roomName}")
	}
	
	def joined(room, participant, name, muted, talking){
		log.debug("joined: $room $participant $name $muted $talking")
		for (Iterator iter = rooms.values().iterator(); iter.hasNext();) {
			VoiceRoom r = (VoiceRoom) iter.next()
			if (r.conference == room) {
				r.joined(participant, name, muted, talking)
				return
			}
		}	
		log.warn("Participant joining to a non-existing room ${room}")
	}
	

	def left(room, participant){
		log.debug("left: $room $participant")
		for (Iterator iter = rooms.values().iterator(); iter.hasNext();) {
			VoiceRoom r = (VoiceRoom) iter.next()
			if (r.conference == room) {
				r.left(participant)
				return
			}
		}	
		log.warn("Participant leaving from a non-existing room ${room}")
	}
	

	def mute(participant, room, mute){
		log.debug("mute: $participant $room $mute")
		for (Iterator iter = rooms.values().iterator(); iter.hasNext();) {
			VoiceRoom r = (VoiceRoom) iter.next()
			if (r.conference == room) {
				log.debug("mute: $participant $room $mute FOUND")
				r.mute(participant, mute)
				return
			}
		}				
		log.warn("Mute/unmute participant on a non-existing room ${room}")
	}
	

	def talk(participant, room, talk){
		log.debug("talk: $participant $room $talk")
		for (Iterator iter = rooms.values().iterator(); iter.hasNext();) {
			VoiceRoom r = (VoiceRoom) iter.next()
			if (r.conference == room) {
				log.debug("talk: $participant $room $talk FOUND")
				r.talk(participant, talk)
				return
			}
		}
		
		log.warn("Talk participant on a non-existing room ${room}")
	}
	
	def participants(room) {
		log.debug("participants: $room")
		VoiceRoom r = getRoom(room)
		if (r != null) {
			log.debug("participants: $room FOUND")
			return r.participants
		}
		
		log.warn("Getting participants on a non-existing room ${room}")
	}
}
