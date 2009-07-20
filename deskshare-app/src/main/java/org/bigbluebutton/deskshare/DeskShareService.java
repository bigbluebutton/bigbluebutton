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
package org.bigbluebutton.deskshare;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

public class DeskShareService {
	final private Logger log = Red5LoggerFactory.getLogger(DeskShareService.class, "deskshare");
	
	private StreamerGateway sg;
	
	public boolean checkIfStreamIsPublishing(){
		String roomName = Red5.getConnectionLocal().getScope().getName();
		log.debug("Checking if {} is streaming.", roomName);
		return sg.isStreaming(roomName);
	}
	
	public int getVideoWidth(){
		String roomName = Red5.getConnectionLocal().getScope().getName();
		log.debug("Getting video width for {}.", roomName);
		return sg.getRoomVideoWidth(roomName);
	}
	
	public int getVideoHeight(){
		String roomName = Red5.getConnectionLocal().getScope().getName();
		log.debug("Getting video height for {}.", roomName);
		return sg.getRoomVideoHeight(roomName);
	}
	
	public void setStreamerGateway(StreamerGateway sg) {
		this.sg = sg;
	}
}
