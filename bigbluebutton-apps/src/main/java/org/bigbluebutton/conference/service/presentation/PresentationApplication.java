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
public class PresentationApplication {

	private static Logger log = Red5LoggerFactory.getLogger( PresentationApplication.class, "bigbluebutton" );	
		
	private static final String APP = "PRESENTATION";
	private PresentationRoomsManager roomsManager;
	
	public boolean createRoom(String name) {
		roomsManager.addRoom(new PresentationRoom(name));
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
	
	public boolean addRoomListener(String room, IPresentationRoomListener listener) {
		if (roomsManager.hasRoom(room)){
			roomsManager.addRoomListener(room, listener);
			return true;
		}
		log.warn("Adding listener to a non-existant room " + room);
		return false;
	}
	
	@SuppressWarnings("unchecked")
	public void sendUpdateMessage(Map message){
		String room = (String) message.get("room");
		if (roomsManager.hasRoom(room)){
			roomsManager.sendUpdateMessage(message);
			return;
		}
		log.warn("Sending update message to a non-existant room " + room);	
	}
		
	public ArrayList<String> getPresentations(String room){
	   if (roomsManager.hasRoom(room)){
            return roomsManager.getPresentations(room);           
        }
        log.warn("Getting presentations on a non-existant room " + room);
        return null;
	}
	
	public void removePresentation(String room, String name){
       if (roomsManager.hasRoom(room)){
            roomsManager.removePresentation(room, name);           
        } else {
        	log.warn("Removing presentation from a non-existant room " + room);
        }
    }
	
	public int getCurrentSlide(String room){
		if (roomsManager.hasRoom(room)){
			return roomsManager.getCurrentSlide(room);			
		}
		log.warn("Getting slide on a non-existant room " + room);
		return -1;
	}
	
	public String getCurrentPresentation(String room){
		if (roomsManager.hasRoom(room)){
			return roomsManager.getCurrentPresentation(room);			
		}
		log.warn("Getting current presentation on a non-existant room " + room);
		return null;
	}
	
	public Map getPresenterSettings(String room){
		if (roomsManager.hasRoom(room)){
			return roomsManager.getPresenterSettings(room);			
		}
		log.warn("Getting settings information on a non-existant room " + room);
		return null;
	}
	
	public Boolean getSharingPresentation(String room){
		if (roomsManager.hasRoom(room)){
			return roomsManager.getSharingPresentation(room);			
		}
		log.warn("Getting share information on a non-existant room " + room);
		return null;
	}
	
	public void resizeAndMoveSlide(String room, Double xOffset, Double yOffset, Double widthRatio, Double heightRatio) {
		if (roomsManager.hasRoom(room)){
			log.debug("Request to resize and move slide[" + xOffset + "," + yOffset + "," + widthRatio + "," + heightRatio + "]");
			roomsManager.resizeAndMoveSlide(room, xOffset, yOffset, widthRatio, heightRatio);
			return;
		}
		log.warn("resizeAndMoveSlide on a non-existant room " + room);		
	}
		
	public void gotoSlide(String room, int slide){
		if (roomsManager.hasRoom(room)){
			log.debug("Request to go to slide " + slide + " for room " + room);
			roomsManager.gotoSlide(room, slide);
			return;
		}
		log.warn("Changing slide on a non-existant room " + room);	
	}
	
	public void sharePresentation(String room, String presentationName, Boolean share){
		if (roomsManager.hasRoom(room)){
			log.debug("Request to share presentation " + presentationName + " " + share + " for room " + room);
			roomsManager.sharePresentation(room, presentationName, share);
			return;
		}
		log.warn("Sharing presentation on a non-existant room " + room);	
	}
	
	public void setRoomsManager(PresentationRoomsManager r) {
		log.debug("Setting room manager");
		roomsManager = r;
		log.debug("Done setting room manager");
	}
}
