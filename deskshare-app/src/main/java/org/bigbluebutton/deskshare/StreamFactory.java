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
import org.red5.server.api.IScope;
import org.slf4j.Logger;

public class StreamFactory {
	final private Logger log = Red5LoggerFactory.getLogger(StreamFactory.class, "deskshare");
	
	private DeskShareApplication app;
	
	public DeskShareStream createStream(CaptureStartEvent event) {
		String room = event.getRoom();
		int width = event.getWidth();
		int height = event.getHeight();
		int frameRate = event.getFrameRate();
		
		IScope scope = app.getAppScope().getScope(room);

		log.debug("Created stream {}", scope.getName());
		return new DeskShareStream(scope, room, width, height, frameRate);
	}
	
	public void setDeskShareApplication(DeskShareApplication app) {
		this.app = app;
		if (app == null) {
			log.error("DeskShareApplication is NULL!!!");
		} else {
			log.debug("DeskShareApplication is NOT NULL!!!");
		}
		
	}
}
