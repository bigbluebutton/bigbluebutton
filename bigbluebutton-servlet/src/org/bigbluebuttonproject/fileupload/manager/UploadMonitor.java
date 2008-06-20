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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.directwebremoting.*;
import org.directwebremoting.proxy.dwr.Util;
// TODO: Auto-generated Javadoc

/**
 * The Class UploadMonitor.
 * 
 * @author ritzalam
 */
public class UploadMonitor {
	
	
	/** The log. */
	private static Log log = LogFactory.getLog(UploadMonitor.class);
	
	/** The upload listener manager. */
	private UploadListenerManager uploadListenerManager;
	
	/** The upload listener. */
	private UploadListener uploadListener;
		
	/**
	 * Gets the update.
	 * 
	 * @param roomNo the room no
	 * 
	 * @return the update
	 */
	public void getUpdate(String roomNo)
	{   
		log.info("Enetering getUpdate...");
		WebContext wctx = WebContextFactory.get();
		Util utilThis = new Util(wctx.getScriptSession());
				
		uploadListener = uploadListenerManager.getListener(roomNo);
		log.info("Initialized uploadListener...");
		
		for(int i = 0; i < uploadListener.getUpdatedMessages().size(); i++)
			{
			if(uploadListener.getUpdatedMessages().isEmpty() == false)
		    utilThis.setValue("response"  , (String) uploadListener.getUpdatedMessages().get(i) );
			}	
		
		log.info("response is being set to the updated messages");
	}
	
    /**
     * Sets the upload listener manager.
     * 
     * @param uploadListenerManager the new upload listener manager
     */
    public void setUploadListenerManager(UploadListenerManager uploadListenerManager) {
		this.uploadListenerManager = uploadListenerManager;
	}
	
	

}
