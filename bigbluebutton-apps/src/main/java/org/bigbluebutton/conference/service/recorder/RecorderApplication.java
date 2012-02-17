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

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 
 * The RecorderApplication class is used for setting the record module 
 * in BigBlueButton for send events messages to a JMS queue.
 * The class follows the same standard as the others modules of BigBlueButton Apps.
 */
public class RecorderApplication {
	private static Logger log = Red5LoggerFactory.getLogger(RecorderApplication.class, "bigbluebutton");
	
	private final Map<String, String> recordingSessions;
	private Recorder recorder;
	
	public RecorderApplication() {
		recordingSessions = new ConcurrentHashMap<String, String>();
		log.debug("Instantiated ArchiveApplication");
	}
	
	/**
	 * Destroy a Record Session
	 * @param sessionName a bigbluebutton session 
	 */
	public void destroyRecordSession(String sessionName) {
		recordingSessions.remove(sessionName);
	}
	
	/**
	 * Creates a record session if there wasn't one created already.
	 * @param conference name of a BigBlueButton conference
	 * @param room name of a room
	 * @param sessionName name of a session
	 */
	public void createRecordSession(String sessionName) {
		recordingSessions.put(sessionName, sessionName);
	}
	
	public void record(String session, RecordEvent message) {
		if (recordingSessions.containsKey(session)) {
			recorder.record(session, message);
		}
	}
	
	public void setRecorder(Recorder recorder) {
		this.recorder = recorder;
		log.debug("setting recorder");
	}
}

