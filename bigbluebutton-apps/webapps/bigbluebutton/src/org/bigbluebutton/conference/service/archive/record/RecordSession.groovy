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

package org.bigbluebutton.conference.service.archive.record

import java.util.concurrent.ConcurrentHashMap
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
public class RecordSession{
	private static Logger log = Red5LoggerFactory.getLogger( RecordSession.class, "bigbluebutton" )
	
	private final String name
	private final String conference
	private final IRecorder recorder
	
	private Map<String, IEventRecorder> recorders
	
	public RecordSession(String conference, String room) {
		name = room
		this.conference = conference
		recorders = new ConcurrentHashMap<String, IEventRecorder>()
	}
	
	public String getName() {
		return name
	}
	
	public void addEventRecorder(IEventRecorder r) {
		synchronized (this) {
			if (! recorders.containsKey(r.getName())) {
				r.acceptRecorder(recorder)
				recorders.put(r.getName(), r)
				log.debug("Added event recorder $r.name")
			} else {
				log.debug("Did not add recorder as it's already there.")
			}
		}				
	}
	
	public void setRecorder(IRecorder recorder) {
		this.recorder = recorder
	}
}
