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
import org.red5.logging.Red5LoggerFactory;import java.util.ArrayList;
import java.util.Map;

public class PresentationRoom {
	private static Logger log = Red5LoggerFactory.getLogger( PresentationRoom.class, "bigbluebutton" );
	
	private final String meetingID;
	private final Boolean recorded;
	
	int currentSlide = 0;
	Boolean sharing = false;
	String currentPresentation = "";
	Double xOffset = 0D;
	Double yOffset = 0D;
	Double widthRatio = 0D;
	Double heightRatio = 0D;
	
	/* cursor location */
	Double xPercent = 0D;
	Double yPercent = 0D;
	
	ArrayList<String> presentationNames = new ArrayList<String>();
	
	public PresentationRoom(String meetingID, Boolean recorded) {
		this.meetingID = meetingID;
		this.recorded = recorded;
	}
	
	public String getMetingID() {
		return meetingID;
	}
	
	public Boolean isRecorded() {
		return recorded;
	}
	
	public void storePresentationNames(Map<String, Object> message){
        String presentationName = (String) message.get("presentationName");
        String messageKey = (String) message.get("messageKey");
             
        if (messageKey.equalsIgnoreCase("CONVERSION_COMPLETED")) {            
            presentationNames.add(presentationName);                                
        }           
    }
	
	public void sendCursorUpdate(Double xPercent, Double yPercent) {
		this.xPercent = xPercent;
		this.yPercent = yPercent;
	}
	
	public void resizeAndMoveSlide(Double xOffset, Double yOffset, Double widthRatio, Double heightRatio) {
		this.xOffset = xOffset;
		this.yOffset = yOffset;
		this.widthRatio = widthRatio;
		this.heightRatio = heightRatio;
				
	}
		
	public void gotoSlide(int curslide){
		currentSlide = curslide;		
	}	
	
	public void sharePresentation(String presentationName, Boolean share){
		sharing = share;
		if (share) {
		  currentPresentation = presentationName;
		  presentationNames.add(presentationName);   
		} else {
		  currentPresentation = "";
		}		
	}
	    
    public void removePresentation(String presentationName){
        int index = presentationNames.indexOf(presentationName);
        
        if (index < 0) {
            return;
        }
        
        presentationNames.remove(index);
               
        if (currentPresentation == presentationName) {
            sharePresentation(presentationName, false);
        }        
    }
    
    public String getCurrentPresentation() {
		return currentPresentation;
	}

	public int getCurrentSlide() {
		return currentSlide;
	}

	public Boolean getSharing() {
		return sharing;
	}

	public ArrayList<String> getPresentationNames() {
		return presentationNames;
	}

	public Double getxOffset() {
		return xOffset;
	}

	public Double getyOffset() {
		return yOffset;
	}

	public Double getWidthRatio() {
		return widthRatio;
	}

	public Double getHeightRatio() {
		return heightRatio;
	}

	
}
