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

import org.red5.logging.Red5LoggerFactory
import org.slf4j.Logger
import org.slf4j.LoggerFactoryimport java.util.Mapimport org.bigbluebutton.conference.Participant
public class VoiceApplication {

	private static Logger log = Red5LoggerFactory.getLogger( VoiceApplication.class, "bigbluebutton" );	
		
	private static final String APP = "VOICE";
	private VoiceRoomsManager roomsManager
	
	public boolean createRoom(String name) {
		roomsManager.addRoom(new VoiceRoom(name))
		return true
	}
	
	public boolean destroyRoom(String name) {
		if (roomsManager.hasRoom(name)) {
			roomsManager.removeRoom(name)
		}
		return true
	}
	
	public boolean hasRoom(String name) {
		return roomsManager.hasRoom(name)
	}
	
	/**
	 * We need to store the conference into the room because
	 * notifications from Asterisk uses conference info
	 * instead of room.
	 */
	public void setConference(String room, String conference) {
		roomsManager.setConference(room, conference)
	}
	
	public boolean addRoomListener(String room, IVoiceRoomListener listener) {
		if (roomsManager.hasRoom(room)){
			roomsManager.addRoomListener(room, listener)
			return true
		}
		log.warn("Adding listener to a non-existant room ${room}")
		return false
	}
	
	def joined(room, participant, name, muted, talking){
		log.debug("joined: $room $participant $name $muted $talking")
		roomsManager.joined(room, participant, name, muted, talking)
	}
	

	def left(room, participant){
		log.debug("left: $room $participant")
		roomsManager.left(room, participant)
	}
	

	def mute(participant, room, mute){
		log.debug("mute: $participant $room $mute")
		roomsManager.mute(participant, room, mute)
	}
	
	def talk(participant, room, talk){
		log.debug("talk: $participant $room $talk")
		roomsManager.talk(participant, room, talk)
	}
	
	def participants(room) {
		log.debug("getting partiicpnats for $room")
		roomsManager.participants(room)
	}
	
	public void setRoomsManager(VoiceRoomsManager r) {
		log.debug("Setting room manager")
		roomsManager = r
	}
}
