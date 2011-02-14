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

import net.jcip.annotations.ThreadSafe;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
/**
 * Contains information about a PresentationRoom. 
 */
@ThreadSafe
public class PresentationRoom {
	private static Logger log = Red5LoggerFactory.getLogger( PresentationRoom.class, "bigbluebutton" );
	
	private final String name;
	private final Map<String, IPresentationRoomListener> listeners;
	
	//TODO: check this type of attributes...
	@SuppressWarnings("unchecked")
	ArrayList currentPresenter = null;
	int currentSlide = 0;
	Boolean sharing = false;
	String currentPresentation = "";
	Double xOffset = 0D;
	Double yOffset = 0D;
	Double widthRatio = 0D;
	Double heightRatio = 0D;
	ArrayList<String> presentationNames = new ArrayList<String>();
    private Double _curSlideWidth = 0D;
	private Double _curSlideHeight = 0D;
    private Double _viewPortWidth = 0D; 
    private Double _viewPortHeight = 0D;
    
	public PresentationRoom(String name) {
		this.name = name;
		listeners   = new ConcurrentHashMap<String, IPresentationRoomListener>();
	}
	
	public String getName() {
		return name;
	}
	
	public void addRoomListener(IPresentationRoomListener listener) {
		if (! listeners.containsKey(listener.getName())) {
			log.debug("adding room listener");
			listeners.put(listener.getName(), listener);			
		}
	}
	
	public void removeRoomListener(IPresentationRoomListener listener) {
		log.debug("removing room listener");
		listeners.remove(listener);		
	}
	
	@SuppressWarnings("unchecked")
	public void sendUpdateMessage(Map message){
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener");
			IPresentationRoomListener listener = (IPresentationRoomListener) iter.next();
			log.debug("calling sendUpdateMessage on listener {}",listener.getName());
			listener.sendUpdateMessage(message);
		}	
		
		storePresentationNames(message);
	}

	@SuppressWarnings("unchecked")
	private void storePresentationNames(Map message){
        String presentationName = (String) message.get("presentationName");
        String messageKey = (String) message.get("messageKey");
             
        if (messageKey.equalsIgnoreCase("CONVERSION_COMPLETED")) {            
            log.debug("{}[{}]",messageKey,presentationName);
            presentationNames.add(presentationName);                                
        }           
    }
	
	public void resizeAndMoveSlide(Double xOffset, Double yOffset, Double widthRatio, Double heightRatio) {
		this.xOffset = xOffset;
		this.yOffset = yOffset;
		this.widthRatio = widthRatio;
		this.heightRatio = heightRatio;
		
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener");
			IPresentationRoomListener listener = (IPresentationRoomListener) iter.next();
			log.debug("calling sendUpdateMessage on listener {}",listener.getName());
			listener.resizeAndMoveSlide(xOffset, yOffset, widthRatio, heightRatio);
		}		
	}
	
    /*****************************************************************************
    ;  shareUpdatePresenterViewDimension
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   This routine is use to call back 'shareUpdatePresenterViewDimension' from 
    ;	IPresentationRoomListener to share the presenter view port information. 
    ;
    ; RETURNS: N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;       curSlideWidth   : the current slide width
    ;       curSlideHeight  : the current slide height
    ;       viewPortWidth   : the view port width
    ;       viewPortHeight  : the view port height
    ;
    ; IMPLEMENTATION
    ;	- call 'shareUpdatePresenterViewDimension' from IPresentationRoomListener
    ;	to share the presenter view port information.
    ;	- call 'setCurrentPresentationPosition' to set the view port information.
    ;	
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 2011.01.27                        Full Screen Presentation window
    ;
    *****************************************************************************/
    @SuppressWarnings("unchecked")
    public void shareUpdatePresenterViewDimension(
						    		Double curSlideWidth, Double curSlideHeight, 
						    		Double viewPortWidth, Double viewPortHeight
						    		) {
        for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
            log.debug("calling on listener");
            IPresentationRoomListener listener = (IPresentationRoomListener) iter.next();
            log.debug("calling sendUpdateMessage on listener {}",listener.getName());
            listener.shareUpdatePresenterViewDimension(
									            		curSlideWidth,curSlideHeight,
									            		viewPortWidth,viewPortHeight
									            		);
        }
        setCurrentPresentationPosition(curSlideWidth,curSlideHeight,viewPortWidth,viewPortHeight);
    }
    /** END Function : shareUpdatePresenterViewDimension **/
	
	public void assignPresenter(ArrayList presenter){
		currentPresenter = presenter;
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener");
			IPresentationRoomListener listener = (IPresentationRoomListener) iter.next();
			log.debug("calling sendUpdateMessage on listener {}",listener.getName());
			listener.assignPresenter(presenter);
		}	
	}
	
	@SuppressWarnings("unchecked")
	public void gotoSlide(int curslide){
		log.debug("Request to go to slide $it for room $name");
		currentSlide = curslide;
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener");
			IPresentationRoomListener listener = (IPresentationRoomListener) iter.next();
			log.debug("calling sendUpdateMessage on listener {}",listener.getName());
			listener.gotoSlide(curslide);
		}			
	}	
	
	@SuppressWarnings("unchecked")
	public void sharePresentation(String presentationName, Boolean share){
		log.debug("Request share presentation "+presentationName+" "+share+" for room "+name);
		sharing = share;
		if (share) {
		  currentPresentation = presentationName;
		} else {
		  currentPresentation = "";
		}
		 
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener");
			IPresentationRoomListener listener = (IPresentationRoomListener) iter.next();
			log.debug("calling sharePresentation on listener {}",listener.getName());
			listener.sharePresentation(presentationName, share);
		}			
	}
	    
    public void removePresentation(String presentationName){
        log.debug("Request remove presentation {}",presentationName);
        int index = presentationNames.indexOf(presentationName);
        
        if (index < 0) {
            log.warn("Request remove presentation {}. Presentation not found.",presentationName);
            return;
        }
        
        presentationNames.remove(index);
        
        for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
            log.debug("calling on listener");
            IPresentationRoomListener listener = (IPresentationRoomListener) iter.next();
            log.debug("calling removePresentation on listener {}",listener.getName());
            listener.removePresentation(presentationName);
        }   
        
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

	public ArrayList getCurrentPresenter() {
		return currentPresenter;
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
    
    /*****************************************************************************
    ;  setCurrentPresentationPosition
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   This routine is use to set the value of presenter view port information.
    ;
    ; RETURNS: N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;       curSlideWidth   : the current slide width
    ;       curSlideHeight  : the current slide height
    ;       viewPortWidth   : the view port width
    ;       viewPortHeight  : the view port height
    ;
    ; IMPLEMENTATION
    ;	set the presenter view port information to the members of 
    ;	PresentatiionRoom.
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 2011.01.27                        Full Screen Presentation window
    ;
    *****************************************************************************/
    public void setCurrentPresentationPosition(
				    		Double curSlideWidth, Double curSlideHeight, 
				    		Double viewPortWidth, Double viewPortHeight
				    		){
        this._curSlideWidth = curSlideWidth ;
        this._curSlideHeight = curSlideHeight ;
        this._viewPortWidth = viewPortWidth ;
        this._viewPortHeight = viewPortHeight ;
        
        log.debug("Update Dimension");
        log.debug("curSlideWidth {}",curSlideWidth);
        log.debug("curSlideHeight {}",curSlideHeight);
        log.debug("viewPortWidth {}",viewPortWidth);
        log.debug("viewPortHeight {}",viewPortHeight);
    }
    /** END Function : setCurrentPresentationPosition **/
    
    /*****************************************************************************
    ;  getCurrentPresenterPosition
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   This routine is use to get the value of presenter view port information.
    ;
    ; RETURNS
    ;   curDimension:   The array list of presenter view port information
    ;
    ; INTERFACE NOTES
    ;	N/A
    ;
    ; IMPLEMENTATION
    ;	set presenter view port information into an ArrayList then return.
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 2011.01.27                        Full Screen Presentation window
    ;
    ******************************************************************************/
    public ArrayList<Double> getCurrentPresenterPosition(){
    	log.debug("Getting presenter view port information");
        ArrayList<Double> curDimension = new ArrayList<Double>();
        if(null == curDimension){
        	log.error("Can not create ArrayList object(curDimension)");
        	return null;
        }
        curDimension.add(this._curSlideWidth) ;
        curDimension.add(this._curSlideHeight) ;
        curDimension.add(this._viewPortWidth) ;
        curDimension.add(this._viewPortHeight) ;
        
        return curDimension ;
        
    }
    /** END Function : getCurrentPresenterPosition **/
}
