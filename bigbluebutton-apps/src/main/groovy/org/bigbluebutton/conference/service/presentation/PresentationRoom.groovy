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

import net.jcip.annotations.ThreadSafeimport java.util.concurrent.ConcurrentHashMapimport java.util.concurrent.CopyOnWriteArrayListimport java.util.Collectionsimport java.util.Iterator
/**
 * Contains information about a PresentationRoom. 
 */
@ThreadSafe
public class PresentationRoom {
	private static Logger log = Red5LoggerFactory.getLogger( PresentationRoom.class, "bigbluebutton" )
	
	private final String name
	private final Map<String, IPresentationRoomListener> listeners
	def currentPresenter
	def currentSlide
	def sharing
	def currentPresentation
	def xOffset
	def yOffset
	def widthRatio
	def heightRatio
	List<String> presentationNames = new ArrayList<String>()
	
	public PresentationRoom(String name) {
		this.name = name
		listeners   = new ConcurrentHashMap<String, IPresentationRoomListener>()
	}
	
	public String getName() {
		return name
	}
	
	public void addRoomListener(IPresentationRoomListener listener) {
		if (! listeners.containsKey(listener.getName())) {
			log.debug("adding room listener")
			listeners.put(listener.getName(), listener)			
		}
	}
	
	public void removeRoomListener(IPresentationRoomListener listener) {
		log.debug("removing room listener")
		listeners.remove(listener)		
	}
	
	def sendUpdateMessage = {
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener")
			IPresentationRoomListener listener = (IPresentationRoomListener) iter.next()
			log.debug("calling sendUpdateMessage on listener ${listener.getName()}")
			listener.sendUpdateMessage(it)
		}	
		
		storePresentationNames(it)
	}
	
	private def storePresentationNames = { message ->
        def presentationName = message['presentationName']
        def messageKey = message['messageKey']
             
        if (messageKey == "CONVERSION_COMPLETED") {            
            log.debug "${messageKey}[$presentationName]"
            presentationNames.add(presentationName)                                
        }           
    }
	
	def resizeAndMoveSlide(xOffset, yOffset, widthRatio, heightRatio) {
		this.xOffset = xOffset;
		this.yOffset = yOffset;
		this.widthRatio = widthRatio;
		this.heightRatio = heightRatio;
		
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener")
			IPresentationRoomListener listener = (IPresentationRoomListener) iter.next()
			log.debug("calling sendUpdateMessage on listener ${listener.getName()}")
			listener.resizeAndMoveSlide(xOffset, yOffset, widthRatio, heightRatio)
		}		
	}
	
	def assignPresenter = {
		currentPresenter = it
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener")
			IPresentationRoomListener listener = (IPresentationRoomListener) iter.next()
			log.debug("calling sendUpdateMessage on listener ${listener.getName()}")
			listener.assignPresenter(it)
		}	
	}
	
	def gotoSlide = {
		log.debug("Request to go to slide $it for room $name")
		currentSlide = it
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener")
			IPresentationRoomListener listener = (IPresentationRoomListener) iter.next()
			log.debug("calling sendUpdateMessage on listener ${listener.getName()}")
			listener.gotoSlide(it)
		}			
	}	
	
	def sharePresentation = {presentationName, share ->
		log.debug("Request share presentation $presentationName $share for room $name")
		sharing = share
		if (share) {
		  currentPresentation = presentationName
		} else {
		  currentPresentation = ""
		}
		 
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener")
			IPresentationRoomListener listener = (IPresentationRoomListener) iter.next()
			log.debug("calling sharePresentation on listener ${listener.getName()}")
			listener.sharePresentation(presentationName, share)
		}			
	}
	    
    def removePresentation = {presentationName ->
        log.debug("Request remove presentation $presentationName")
        def index = presentationNames.indexOf(presentationName)
        
        if (index < 0) {
            log.warn("Request remove presentation $presentationName. Presentation not found.")
            return
        }
        
        presentationNames.remove(index)
        
        for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
            log.debug("calling on listener")
            IPresentationRoomListener listener = (IPresentationRoomListener) iter.next()
            log.debug("calling removePresentation on listener ${listener.getName()}")
            listener.removePresentation(presentationName)
        }   
        
        if (currentPresentation == presentationName) {
            sharePresentation(presentationName, false)
        }        
    }
}
