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
    private boolean _isFullScreen = false ;
    private Double curSlideWidth = 0D;
	private Double curSlideHeight = 0D;
    private Double viewPortWidth = 0D; 
    private Double viewPortHeight = 0D;
    
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
        ;   This routine is use to call back 'shareUpdatePresenterViewDimension' from IPresentationRoomListener 
        ;
        ; RETURNS
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;       curSlideWidth   : the current slide width
        ;       curSlideHeight  : the current slide height
        ;       viewPortWidth   : the view port width
        ;       viewPortHeight  : the view port height
        ;
        ; IMPLEMENTATION
        ;
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 2011.01.27                        Full Screen Presenation widnow
        ;
        ******************************************************************************/
    @SuppressWarnings("unchecked")
    public void shareUpdatePresenterViewDimension(Double curSlideWidth, Double curSlideHeight, Double viewPortWidth, Double viewPortHeight) {
        for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
            log.debug("calling on listener");
            IPresentationRoomListener listener = (IPresentationRoomListener) iter.next();
            log.debug("calling sendUpdateMessage on listener {}",listener.getName());
            listener.shareUpdatePresenterViewDimension(curSlideWidth,curSlideHeight,viewPortWidth,viewPortHeight);
        }
        setCurrentPresentationPosition(curSlideWidth,curSlideHeight,viewPortWidth,viewPortHeight);
    }
    /** END Function : shareUpdatePresenterViewDimension **/
    
        /*****************************************************************************
        ;  setFullScreen
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   This routine is use to call back 'setFullScreen' from IPresentationRoomListener 
        ;
        ; RETURNS
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;       status  : the presenter full screen presentation window status
        ;
        ; IMPLEMENTATION
        ;
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 2011.01.27                        Full Screen Presenation widnow
        ;
        ******************************************************************************/
    @SuppressWarnings("unchecked")
    public void setFullScreen(boolean isFullScreen) {
        this._isFullScreen = isFullScreen ;
        for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
            log.debug("calling on listener");
            IPresentationRoomListener listener = (IPresentationRoomListener) iter.next();
            log.debug("calling sendUpdateMessage on listener {}",listener.getName());
            listener.setFullScreen(isFullScreen);
        }
    }
    /** END Function : setFullScreen **/
    
        /*****************************************************************************
        ;  getFullScreenStatus
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   This routine is use to get the '_isFullScreen' the presenter full screen status
        ;
        ; RETURNS
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;       status  : the presenter full screen presentation window status
        ;
        ; IMPLEMENTATION
        ;
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 2011.01.27                        Full Screen Presenation widnow
        ;
        ******************************************************************************/
    public boolean getFullScreenStatus(){
        return this._isFullScreen ;
    }
    /** END Function : getFullScreenStatus **/
	
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
        ; RETURNS
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;       curSlideWidth   : the current slide width
        ;       curSlideHeight  : the current slide height
        ;       viewPortWidth   : the view port width
        ;       viewPortHeight  : the view port height
        ;
        ; IMPLEMENTATION
        ;
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 2011.01.27                        Full Screen Presenation widnow
        ;
        ******************************************************************************/
    public void setCurrentPresentationPosition(Double curSlideWidth, Double curSlideHeight, Double viewPortWidth, Double viewPortHeight){
        this.curSlideWidth = curSlideWidth ;
        this.curSlideHeight = curSlideHeight ;
        this.viewPortWidth = viewPortWidth ;
        this.viewPortHeight = viewPortHeight ;
        
        log.debug("Update Dimension");
        log.debug("curSlideWidth {}",curSlideWidth);
        log.debug("curSlideHeight {}",curSlideHeight);
        log.debug("viewPortWidth {}",viewPortWidth);
        log.debug("viewPortHeight {}",viewPortHeight);
    }
    /** END Function : setCurrentPresentationPosition **/
    
    public ArrayList<Double> getCurrentPresenterPosition(){
        ArrayList<Double> curDimension = new ArrayList<Double>();
        curDimension.add(this.curSlideWidth) ;
        curDimension.add(this.curSlideHeight) ;
        curDimension.add(this.viewPortWidth) ;
        curDimension.add(this.viewPortHeight) ;
        
        return curDimension ;
        
    }
}
