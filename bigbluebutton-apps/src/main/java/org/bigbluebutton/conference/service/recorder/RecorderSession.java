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
package org.bigbluebutton.conference.service.recorder;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

/** 
 * 
 * The RecorderSession class handles a BigBlueButton recorder session.
 * 
 * */
public class RecorderSession {
	
	/** A log instance */
	private static Logger log = Red5LoggerFactory.getLogger( RecorderSession.class, "bigbluebutton" );
	
	/** room name */
	private final String name;
	
	/** TODO conference attribute is unused */
	private final String conference;
	
	/** A IRecorder instance */
	private IRecorder recorder;
	
	/** A hashmap with the recorders of all modules */
	private Map<String, IEventRecorder> recorders;
	
	/** 
	 * Default constructor for RecorderSession
	 * It sets a recorder session.
	 * @param conference name of a conference
	 * @param room name of a room
	 * */
	public RecorderSession(String conference, String room) {
		name = room;
		this.conference = conference;
		recorders = new ConcurrentHashMap<String, IEventRecorder>();
	}
	
	/** 
	 * Returns the name of the conference room
	 * @return room name
	 * */
	public String getName() {
		return name;
	}
	
	/**
	 * The method adds an instance of a RecorderEventDispatcher to each module through the acceptRecorder method.
	 * @param r a IEventRecorder from each module to record. 
	 * @see IEventRecorder
	 * @see IRecorder
	 * @see RecorderEventDispatcher 
	 */
	public void addEventRecorder(IEventRecorder r) {
		synchronized (this) {
			if (! recorders.containsKey(r.getName())) {
				r.acceptRecorder(recorder);
				recorders.put(r.getName(), r);
				log.debug("Added event recorder {}",r.getName());
			} else {
				log.debug("Did not add recorder as it's already there.");
			}
		}				
	}
	
	/**
	 * Sets a recorder event dispatcher to the BigBlueButton Session.
	 * @param recorder an interface of a IRecorder. 
	 * @see IRecorder
	 * @see RecorderEventDispatcher
	 */
	public void setRecorder(IRecorder recorder) {
		this.recorder = recorder;
	}
}
