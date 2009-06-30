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

package org.bigbluebutton.conference.service.archive

import org.red5.server.adapter.IApplication
import org.red5.server.api.IClient
import org.red5.server.api.IConnection
import org.red5.server.api.IScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

import org.red5.server.api.so.ISharedObject
import org.red5.server.adapter.ApplicationAdapter
import org.red5.server.api.Red5import java.util.Mapimport org.bigbluebutton.conference.RoomsManager
import org.bigbluebutton.conference.Roomimport org.bigbluebutton.conference.Participant
public class ArchiveService {

	private static Logger log = Red5LoggerFactory.getLogger(ArchiveService.class, "bigbluebutton")
	
	private ArchiveApplication application

	public void startPlayback(String name) {
		log.debug("Request to playback $name")
		assert application != null
		application.startPlayback(name)
	}
	
	public void stopPlayback(String name) {
		assert application != null
		application.stopPlayback(name)
	}
	
	public void pausePlayback(String name) {
		assert application != null
		application.pausePlayback(name)
	}
	
	public void resumePlayback(String name) {
		assert application != null
		application.resumePlayback(name)
	}
		
	public void setArchiveApplication(ArchiveApplication a) {
		log.debug("Setting archive Applications")
		application = a
	}
}
