/** 
* ===License Header===
*
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
* ===License Header===
*/
package org.bigbluebutton.conference.service.presentation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.red5.logging.Red5LoggerFactory;

import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

import net.jcip.annotations.ThreadSafe;
import java.util.concurrent.ConcurrentHashMap;
/**
 * This encapsulates access to Room and messages. This class must be threadsafe.
 */
@ThreadSafe
public class PresentationRoomsManager {
	private static Logger log = Red5LoggerFactory.getLogger( PresentationRoomsManager.class, "bigbluebutton" );
	
	private final Map <String, PresentationRoom> rooms;
	
	public PresentationRoomsManager() {
		log.debug("In PresentationRoomsManager constructor");	
		rooms = new ConcurrentHashMap<String, PresentationRoom>();
	}
	
	public void addRoom(PresentationRoom room) {
		log.debug("In PresentationRoomsManager adding room " + room.getName());
		rooms.put(room.getName(), room);
	}
	
	public void removeRoom(String name) {
		log.debug("In PresentationRoomsManager remove room " + name);
		rooms.remove(name);
	}
		
	public boolean hasRoom(String name) {
		log.debug("In PresentationRoomsManager has Room " + name);
		return rooms.containsKey(name);
	}
	
	
	/**
	 * Keeping getRoom private so that all access to ChatRoom goes through here.
	 */
	private PresentationRoom getRoom(String name) {
		log.debug("In PresentationRoomsManager get room " + name);
		return rooms.get(name);
	}
		
	public void addRoomListener(String roomName, IPresentationRoomListener listener) {
		PresentationRoom r = getRoom(roomName);
		if (r != null) {
			r.addRoomListener(listener);
			return;
		}
		log.warn("Adding listener to a non-existing room " + roomName);
	}
	//TODO: where is roomName???
	/*public void removeRoomListener(IPresentationRoomListener listener) {
		PresentationRoom r = getRoom(roomName);
		if (r != null) {
			r.removeRoomListener(listener);
			return;
		}	
		log.warn("Removing listener from a non-existing room ${roomName}");
	}*/
	
	public void sendUpdateMessage(Map message){
		String room = (String) message.get("room");
		PresentationRoom r = getRoom(room);
		if (r != null) {
			r.sendUpdateMessage(message);
			return;
		}	
		log.warn("Sending update message to a non-existing room " + room);			
	}
		
	public Boolean getSharingPresentation(String room){
		PresentationRoom r = getRoom(room);
		if (r != null) {
			return r.getSharing();			
		}	
		log.warn("Getting sharing from a non-existing room " + room);
		return null;
	}
		
	@SuppressWarnings("unchecked")
	public Map getPresenterSettings(String room){
		PresentationRoom r = getRoom(room);
		if (r != null){
			Map settings = new HashMap();
			settings.put("xOffset", r.getxOffset());
			settings.put("yOffset", r.getyOffset());
			settings.put("widthRatio", r.getWidthRatio());
			settings.put("heightRatio", r.getHeightRatio());
			return settings;			
		}
		log.warn("Getting settings information on a non-existant room " + room);	
		return null;
	}
	
	public void resizeAndMoveSlide(String room, Double xOffset, Double yOffset, Double widthRatio, Double heightRatio) {
		PresentationRoom r = getRoom(room);
		if (r != null){
			log.debug("Request to resize and move slide[" + xOffset + "," + yOffset + "," + widthRatio + "," + heightRatio + "]");
			r.resizeAndMoveSlide(xOffset, yOffset, widthRatio, heightRatio);
			return;
		}
		log.warn("resizeAndMoveSlide on a non-existant room " + room);		
	}
	
	public void gotoSlide(String room, int slide){
		PresentationRoom r = getRoom(room);
		if (r != null) {
			log.debug("Request to go to slide " + slide + " for room " + room);
			r.gotoSlide(slide);
			return;
		}	
		log.warn("Changing slide on a non-existing room " + room);	
	}
	
	public void sharePresentation(String room, String presentationName, Boolean share){
		PresentationRoom r = getRoom(room);
		if (r != null) {
			log.debug("Request share presentation " + presentationName + " " + share + " for room " + room);
			r.sharePresentation(presentationName, share);
			return;
		}	
		log.warn("Sharing presentation on a non-existing room " + room);	
	}
	
	public int getCurrentSlide(String room){
		PresentationRoom r = getRoom(room);
		if (r != null) {
			return r.getCurrentSlide();
		}	
		log.warn("Getting slide on a non-existing room " + room);
		return -1;
	}
	
	public String getCurrentPresentation(String room){
		PresentationRoom r = getRoom(room);
		if (r != null) {
			return r.getCurrentPresentation();
		}	
		log.warn("Getting current presentation on a non-existing room " + room);
		return null;
	}
	
	public ArrayList<String> getPresentations(String room){
        PresentationRoom r = getRoom(room);
        if (r != null) {
            return r.getPresentationNames();
        }   
        log.warn("Getting current presentation on a non-existing room " + room);
        return null;
    }
    
    public void removePresentation (String room, String name){
        PresentationRoom r = getRoom(room);
        if (r != null) {
            r.removePresentation(name);
        } else {  
        	log.warn("Removing presentation from a non-existing room " + room);
        }
    }
}
