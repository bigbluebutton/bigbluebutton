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

package org.bigbluebuttonproject.fileupload.manager;

import java.util.HashMap;
import java.util.Map;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
// TODO: Auto-generated Javadoc

/**
 * The Class UploadListenerManager.
 * 
 * @author ritzalam
 */
public class UploadListenerManager  {
	
	/** The log. */
	private static Log log = LogFactory.getLog(UploadListenerManager.class);
	
	/** The room no. */
	private String roomNo;
	
	/** The upload listener. */
	private UploadListener uploadListener;
	
	/** The rooms. */
	private Map <String, UploadListener> rooms = new HashMap<String, UploadListener>();
    
	/**
	 * Gets the listener.
	 * 
	 * @param roomNo the room no
	 * 
	 * @return the listener
	 */
	public UploadListener getListener (String roomNo)
    {
		log.info("getting upload listener..");
		return rooms.get(roomNo);
    }
	
    /**
     * Adds the listener.
     * 
     * @param roomNo the room no
     * @param uploadListener the upload listener
     */
    public void addListener(String roomNo , UploadListener uploadListener)
    {
    	log.info("adding upload listener to UploadListenerManager...");
    	this.uploadListener = uploadListener;
    	this.roomNo = roomNo;
    	rooms.put(roomNo, this.uploadListener);
    }
   
    /**
     * Creates the upload listener.
     * 
     * @param roomNo the room no
     * 
     * @return the upload listener
     */
    public UploadListener createUploadListener(String roomNo)
    {
    	uploadListener = new UploadListener(roomNo);
    	log.info("creating upload listener..");
    	return uploadListener;
    }
    
}
