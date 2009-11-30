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

package org.bigbluebutton.conference

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

public class BigBlueButtonSession {
	private static Logger log = Red5LoggerFactory.getLogger(BigBlueButtonSession.class, "bigbluebutton")
	
	private final def username
	private final def role
	private final def conference
	private final def mode
	private final def room
	private final def userid
	private final def sessionName
	private final String voiceBridge
	private final Boolean record
	
	public BigBlueButtonSession(def sessionName, def userid, def username, 
				def role, def conference, def mode, def room, String voiceBridge, Boolean record){
		this.userid = userid
		this.sessionName = sessionName
		this.username = username
		this.role = role
		this.conference = conference
		this.mode = mode
		this.room = room
		
		this.voiceBridge = voiceBridge
		this.record = record
	}
	
	def playbackMode() {
		mode == Constants.PLAYBACK_MODE
	}
	
//	def voiceBridge() {
//		return voiceBridge
//	}
	
	
//	public Long getUserid() {
//		return userid
//	}
}
