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
import org.bigbluebutton.conference.MeetingsManager;
import org.bigbluebutton.conference.meeting.messaging.OutMessageGateway;
import org.bigbluebutton.conference.service.presentation.messaging.messages.ConversionUpdateMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.GetPresentationInforReplyMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.GetSlideInfoReply;
import org.bigbluebutton.conference.service.presentation.messaging.messages.GotoSlideMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.PresentationCursorUpdateMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.RemovePresentationMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.ResizeAndMoveSlideMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.SharePresentationMessage;
import org.red5.logging.Red5LoggerFactory;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class PresentationApplication {
	private static Logger log = Red5LoggerFactory.getLogger( PresentationApplication.class, "bigbluebutton" );	
		
	private final Map <String, PresentationRoom> rooms = new ConcurrentHashMap<String, PresentationRoom>();
	
	private MeetingsManager roomsManager;
	private OutMessageGateway outMessageGateway;
	
	private PreuploadedPresentationsUtil presUtil = new PreuploadedPresentationsUtil();
	
	public void setOutMessageGateway(OutMessageGateway outMessageGateway) {
		this.outMessageGateway = outMessageGateway;
	}
	
	public void setRoomsManager(MeetingsManager r) {
		log.debug("Setting room manager");
		roomsManager = r;
	}
	
	public boolean createRoom(String meetingID, Boolean recorded) {
		if (!hasRoom(meetingID)) {
			PresentationRoom room = new PresentationRoom(meetingID, recorded);
			rooms.put(room.getMetingID(), room);
			ArrayList<String> pres = presUtil.getPreuploadedPresentations(meetingID);
			if (!pres.isEmpty()) {
				for (String presFile : pres) {
					sharePresentation(meetingID, presFile, true);
				}
			}
		}

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
	
	public void clear(String meetingID) {
	       if (hasRoom(meetingID)){
		        PresentationRoom r = getRoom(meetingID);
		        if (r != null) {
		        	// Unshare the presentation.
		        	sharePresentation(meetingID, r.currentPresentation, false);
		        }       
	        }		
	}
	
	public void sendUpdateMessage(Map<String, Object> message){	
		String room = (String) message.get("room");
		if (hasRoom(room)){
			PresentationRoom r = getRoom(room);
			r.storePresentationNames(message);
			ConversionUpdateMessage msg = new ConversionUpdateMessage(r.getMetingID(), r.isRecorded(), message);
			outMessageGateway.send(msg);
		}	
	}
			
	public void removePresentation(String room, String presentationID){
       if (hasRoom(room)){
	        PresentationRoom r = getRoom(room);
	        if (r != null) {
	     	   r.removePresentation(presentationID); 	  
	     	   RemovePresentationMessage msg = new RemovePresentationMessage(r.getMetingID(), r.isRecorded(), presentationID);
	     	  outMessageGateway.send(msg);
	        }       
        }
    }
	
	public void getPresentationInfo(String meetingID, String requesterID) {
		ArrayList<String> curPresenter = roomsManager.getCurrentPresenter(meetingID);
		
		int curSlide = getCurrentSlide(meetingID);
		Boolean isSharing = getSharingPresentation(meetingID);
		String currentPresentation = getCurrentPresentation(meetingID);
		
		Map<String, Double> presentersSettings = getPresenterSettings(meetingID);
		ArrayList<String> presentationNames = getPresentations(meetingID);
		
		Map<String, Object> presenter = new HashMap<String, Object>();		
		if (curPresenter != null) {
			presenter.put("hasPresenter", true);
			presenter.put("user", curPresenter.get(0));
			presenter.put("name", curPresenter.get(1));
			presenter.put("assignedBy",curPresenter.get(2));
			log.debug("Presenter: " + curPresenter.get(0) + " " + curPresenter.get(1) + " " + curPresenter.get(2));
		} else {
			presenter.put("hasPresenter", false);
		}
				
		Map<String, Object> presentation = new HashMap<String, Object>();
		if (isSharing.booleanValue()) {
			presentation.put("sharing", true);
			presentation.put("slide", curSlide);
			presentation.put("currentPresentation", currentPresentation);
			if (presentersSettings != null) {
				presentation.put("xOffset", presentersSettings.get("xOffset"));
				presentation.put("yOffset", presentersSettings.get("yOffset"));
				presentation.put("widthRatio", presentersSettings.get("widthRatio"));
				presentation.put("heightRatio", presentersSettings.get("heightRatio"));
			}
			System.out.println("** presentersSettings [" + presentersSettings.get("xOffset") + "," + presentersSettings.get("yOffset") + "] [" + presentersSettings.get("widthRatio") + "," + presentersSettings.get("heightRatio") + "] !!!!!!!!!!!!!!!!!!!!!!");
		} else {
			presentation.put("sharing", false);
		}
		
		Map<String, Object> presentationInfo = new HashMap<String, Object>();
		presentationInfo.put("presenter", presenter);
		presentationInfo.put("presentation", presentation);
		presentationInfo.put("presentations", presentationNames);
		
		if (hasRoom(meetingID)){
			PresentationRoom r = getRoom(meetingID);
			if (r != null) {
				GetPresentationInforReplyMessage msg = new GetPresentationInforReplyMessage(r.getMetingID(), r.isRecorded(), requesterID, presentationInfo);
				outMessageGateway.send(msg);
			}            
		}
	}
	
	private ArrayList<String> getPresentations(String room){
		if (hasRoom(room)){
			PresentationRoom r = getRoom(room);
			if (r != null) {
				ArrayList<String> pres = r.getPresentationNames();
				return pres;
			}            
		}

		return null;
	}
	
	private int getCurrentSlide(String room){
		if (hasRoom(room)){
			PresentationRoom r = getRoom(room);
			if (r != null) {
				return r.currentSlide;
			}
						
		}
		return -1;
	}
	
	private String getCurrentPresentation(String room){
		if (hasRoom(room)){
			PresentationRoom r = getRoom(room);
			if (r != null) {
				return r.currentPresentation;
			}		
		}
		return null;
	}
	
	private Map<String, Double> getPresenterSettings(String room){
		if (hasRoom(room)){
			PresentationRoom r = getRoom(room);
			if (r != null){
				Map<String, Double> settings = new HashMap<String, Double>();
				settings.put("xOffset", r.getxOffset());
				settings.put("yOffset", r.getyOffset());
				settings.put("widthRatio", r.getWidthRatio());
				settings.put("heightRatio", r.getHeightRatio());
				return settings;			
			}		
		}

		return null;
	}
	
	public Boolean getSharingPresentation(String room){
		if (hasRoom(room)){
			PresentationRoom r = getRoom(room);
			if (r != null){
				return r.sharing;
			}			
		}

		return null;
	}
	
	public void sendCursorUpdate(String room, Double xPercent, Double yPercent) {	
		if (hasRoom(room)){
			PresentationRoom r = getRoom(room);
			if (r != null){
				r.sendCursorUpdate(xPercent, yPercent);
				PresentationCursorUpdateMessage msg = new PresentationCursorUpdateMessage(r.getMetingID(), r.isRecorded(), xPercent, yPercent);
				outMessageGateway.send(msg);
			}
		}
	}
	
	public void resizeAndMoveSlide(String room, Double xOffset, Double yOffset, Double widthRatio, Double heightRatio) {
		if (hasRoom(room)){
			PresentationRoom r = getRoom(room);
			if (r != null){
				System.out.println("** Resize and move [" + xOffset + "," + yOffset + "] [" + widthRatio + "," + heightRatio + "] !!!!!!!!!!!!!!!!!!!!!!");
				r.resizeAndMoveSlide(xOffset, yOffset, widthRatio, heightRatio);
				ResizeAndMoveSlideMessage msg = new ResizeAndMoveSlideMessage(r.getMetingID(), r.isRecorded(), xOffset, yOffset, widthRatio, heightRatio);
				outMessageGateway.send(msg);
			}
		}	
	}
		
	public void gotoSlide(String room, int slide){
		if (hasRoom(room)){
			PresentationRoom r = getRoom(room);
			if (r != null){
				r.gotoSlide(slide);
				GotoSlideMessage msg = new GotoSlideMessage(r.getMetingID(), r.isRecorded(), slide);
				outMessageGateway.send(msg);
			}
		}	
	}
	
	public void sharePresentation(String room, String presentationID, Boolean share){
		if (hasRoom(room)){
			PresentationRoom r = getRoom(room);
			if (r != null){
				r.sharePresentation(presentationID, share);
				SharePresentationMessage msg = new SharePresentationMessage(r.getMetingID(), r.isRecorded(), presentationID, share);
				outMessageGateway.send(msg);
			}
		}
	}
	
	public void getSlideInfo(String meetingID, String requesterID) {
		if (hasRoom(meetingID)){
			PresentationRoom r = getRoom(meetingID);
			if (r != null){
				Map<String, Double> info = getPresenterSettings(meetingID);
				if (info != null) {
					GetSlideInfoReply msg = new GetSlideInfoReply(meetingID, r.isRecorded(), requesterID, r.xOffset, r.yOffset, r.widthRatio, r.heightRatio);
					outMessageGateway.send(msg);
				}				
			}
		}
	}
		
}
