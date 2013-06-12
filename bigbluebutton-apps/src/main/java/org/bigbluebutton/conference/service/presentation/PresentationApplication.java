/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
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
package org.bigbluebutton.conference.service.presentation;

import org.slf4j.Logger;
import org.bigbluebutton.conference.meeting.messaging.OutMessageGateway;
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.service.presentation.messaging.red5.PresentationClientSender;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class PresentationApplication {
	private static Logger log = Red5LoggerFactory.getLogger( PresentationApplication.class, "bigbluebutton" );	
		
	private final Map <String, PresentationRoom> rooms = new ConcurrentHashMap<String, PresentationRoom>();
	
	private OutMessageGateway outMessageGateway;
	
	public void setOutMessageGateway(OutMessageGateway outMessageGateway) {
		this.outMessageGateway = outMessageGateway;
	}
	
	public boolean createRoom(String name, Boolean recorded) {
		PresentationRoom room = new PresentationRoom(name);
		rooms.put(room.getName(), room);
		return true;
	}
	
	public boolean destroyRoom(String name) {
		if (hasRoom(name)) {
			rooms.remove(name);
		}
		return true;
	}
	
	public boolean hasRoom(String name) {
		return rooms.containsKey(name);
	}
	
	private PresentationRoom getRoom(String name) {
		return rooms.get(name);
	}
		
	@SuppressWarnings("unchecked")
	public void sendUpdateMessage(Map<String, Object> message){
	
		String room = (String) message.get("room");
		if (hasRoom(room)){
			PresentationRoom r = getRoom(room);
			r.storePresentationNames(message);
			return;
		}
		log.warn("Sending update message to a non-existant room " + room);	
	}
		
	public void getPresentations(String room){
	   if (hasRoom(room)){
	        PresentationRoom r = getRoom(room);
	        if (r != null) {
	        	ArrayList<String> pres = r.getPresentationNames();
	        	
	        }            
        }
	}
	
	public void removePresentation(String room, String name){
       if (hasRoom(room)){
	        PresentationRoom r = getRoom(room);
	        if (r != null) {
	     	   r.removePresentation(name); 	        	
	        }       
        }
    }
	
	public void getPresentationInfo(String meetingID, String requesterID) {
		
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
	
	public void sendCursorUpdate(String room, Double xPercent, Double yPercent) {	
		if (roomsManager.hasRoom(room)){
			log.debug("Request to update cursor[" + xPercent + "," + yPercent + "]");
			roomsManager.sendCursorUpdate(room, xPercent, yPercent);
			
			Map<String, Object> message = new HashMap<String, Object>();	
			message.put("xPercent", xPercent);
			message.put("yPercent", yPercent);
			BroadcastClientMessage m = new BroadcastClientMessage(getMeetingId(), "PresentationCursorUpdateCommand", message);
			connInvokerService.sendMessage(m);
			
			return;
		}
				
		log.warn("Sending cursor update on a non-existant room " + room);
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

	private String getMeetingId(){
		return Red5.getConnectionLocal().getScope().getName();
	}
	
	
	public void setPresentationClientSender(PresentationClientSender sender) {
		this.sender = sender;
	}	
}
