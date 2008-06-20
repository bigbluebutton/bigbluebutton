/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebuttonproject.presentation;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.red5.server.api.so.ISharedObject;


/**
 * The listener interface for receiving conversionUpdates events.
 * The class that is interested in processing a conversionUpdates
 * event implements this interface, and the object created
 * with that class is registered with a component using the
 * component's <code>addConversionUpdatesListener<code> method. When
 * the conversionUpdates event occurs, that object's appropriate
 * method is invoked.
 * 
 * @see ConversionUpdatesEvent
 */
public class ConversionUpdatesListener {
	
	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(ConversionUpdatesListener.class);
	
	/** The presentation s os. */
	private static Map<Integer, ISharedObject> presentationSOs = new HashMap<Integer, ISharedObject>();

    /**
     * Adds the room.
     * 
     * @param room the room
     * @param so the so
     */
    public void addRoom(Integer room, ISharedObject so) {
    	presentationSOs.put(room, so);
    }

    /**
     * Updates the clients with message passed in the parameter. Called from ConversionUpdatesServiceThread.
     * 
     * @param room the room
     * @param code the code
     * @param message the message
     */
    public void updateMessage(Integer room, Integer code, String message) {
    	if (! presentationSOs.containsKey(room)) {
    		log.info("Getting updates message from unknown room [" + room + "]");
    		return;
    	}
    	
    	ISharedObject so = presentationSOs.get(room);
    	Map <String, Object> update = new HashMap<String, Object>();
    	// update the atribute space of the sharedobject and clients sync with it.
    	so.beginUpdate();
    	
    	if (code == ReturnCode.SUCCESS.value()) {
    		update.put("returnCode", "SUCCESS");
        	update.put("message", message);
    	} else if (code == ReturnCode.UPDATE.value()) {
    		update.put("returnCode", "UPDATE");
        	update.put("message", message);    		
    	} else {
    		update.put("returnCode", "FAILED");
        	update.put("message", message);
    	}
    	so.setAttribute("updateMessage", update);
    	so.endUpdate();
    }
    
    /**
     * Updates the clients with message passed in the parameters. Called from ConversionUpdatesServiceThread.
     * 
     * @param room the room
     * @param code the code
     * @param totalSlides the total slides
     * @param completedSlides the completed slides
     */
    public void updateMessage(Integer room, Integer code, Integer totalSlides, Integer completedSlides) {
    	if (! presentationSOs.containsKey(room)) {
    		log.info("Getting updates message from unknown room [" + room + "]");
    		return;
    	}
    	
    	ISharedObject so = presentationSOs.get(room);
    	Map <String, Object> update = new HashMap<String, Object>();
    	// update the atribute space of the sharedobject and clients sync with it.
    	so.beginUpdate();
    	if (code == ReturnCode.EXTRACT.value()) {
    		update.put("returnCode", "EXTRACT");
    		update.put("totalSlides", totalSlides);
    		update.put("completedSlides", completedSlides);
    	} else if (code == ReturnCode.CONVERT.value()) {   		
    		update.put("returnCode", "CONVERT");
    		update.put("totalSlides", totalSlides);
    		update.put("completedSlides", completedSlides);
    	}
    	
    	so.setAttribute("updateMessage", update);
    	so.endUpdate();
    }    
}
