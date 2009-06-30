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

package org.bigbluebutton.conference.service.presentation


import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
import java.util.Map
public class PresentationApplication {

	private static Logger log = Red5LoggerFactory.getLogger( PresentationApplication.class, "bigbluebutton" );	
		
	private static final String APP = "PRESENTATION";
	private PresentationRoomsManager roomsManager
	
	public boolean createRoom(String name) {
		roomsManager.addRoom(new PresentationRoom(name))
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
	
	public boolean addRoomListener(String room, IPresentationRoomListener listener) {
		if (roomsManager.hasRoom(room)){
			roomsManager.addRoomListener(room, listener)
			return true
		}
		log.warn("Adding listener to a non-existant room ${room}")
		return false
	}
	
	public String getCurrentSlide(String room) {
		return roomsManager.getCurrentSlide(room)
	}
	
	def sendUpdateMessage = {message ->
		def room = message['room']
		if (roomsManager.hasRoom(room)){
			roomsManager.sendUpdateMessage(message)
			return
		}
		log.warn("Sending update message to a non-existant room ${room}")	
	}
	
	def getCurrentPresenter = {room ->
		if (roomsManager.hasRoom(room)){
			return roomsManager.getCurrentPresenter(room)			
		}
		log.warn("Getting presenter on a non-existant room ${room}")	
	}
	
	def getCurrentSlide = {room ->
		if (roomsManager.hasRoom(room)){
			return roomsManager.getCurrentSlide(room)			
		}
		log.warn("Getting slide on a non-existant room ${room}")	
	}
	
	def getCurrentPresentation = {room ->
		if (roomsManager.hasRoom(room)){
			return roomsManager.getCurrentPresentation(room)			
		}
		log.warn("Getting current presentation on a non-existant room ${room}")	
	}
	
	def getSharingPresentation = {room ->
		if (roomsManager.hasRoom(room)){
			return roomsManager.getSharingPresentation(room)			
		}
		log.warn("Getting share information on a non-existant room ${room}")	
	}
	
	def assignPresenter = {room, presenter ->
		if (roomsManager.hasRoom(room)){
			roomsManager.assignPresenter(room, presenter)
			return
		}
		log.warn("Assigning presenter on a non-existant room ${room}")	
	}
	
	def gotoSlide = {room, slide ->
		if (roomsManager.hasRoom(room)){
			log.debug("Request to go to slide $slide for room $room")
			roomsManager.gotoSlide(room, slide)
			return
		}
		log.warn("Changing slide on a non-existant room ${room}")	
	}
	
	def sharePresentation = {room, presentationName, share ->
		if (roomsManager.hasRoom(room)){
			log.debug("Request to share presentation $presentationName $share for room $room")
			roomsManager.sharePresentation(room, presentationName, share)
			return
		}
		log.warn("Sharing presentation on a non-existant room ${room}")	
	}
	
	public void setRoomsManager(PresentationRoomsManager r) {
		log.debug("Setting room manager")
		roomsManager = r
		log.debug("Done setting room manager")
	}
}
