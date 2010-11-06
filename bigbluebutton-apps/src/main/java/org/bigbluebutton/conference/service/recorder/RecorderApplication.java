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
import org.springframework.jms.core.JmsTemplate;
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
	
	/** A log instance */
	private static Logger log = Red5LoggerFactory.getLogger(RecorderApplication.class, "bigbluebutton");
	
	/** A JmsTemplate from the spring framework */
	private JmsTemplate jmsTemplate;
	
	/** A Hashmap with all the BigBlueButton sessions */
	private final Map<String, RecorderSession> recordSessions;
	
	/** 
	 * Default constructor for RecorderApplication
	 * It sets the session hashmap.
	 * @see RecorderSession 
	 * */
	public RecorderApplication() {
		recordSessions = new ConcurrentHashMap<String, RecorderSession>();
		log.debug("Instantiated ArchiveApplication");
	}
	
	/**
	 * Destroy a Record Session
	 * @param sessionName a bigbluebutton session 
	 */
	public void destroyRecordSession(String sessionName) {
		RecorderSession s = recordSessions.remove(sessionName);
		/*
		 * ConcurrentHashMap returns null if sessionName is not found.
		 */
		if (s != null) {
			log.debug("Removed record session");
		} else {
			log.debug("Could not find record session {}",sessionName);
		}
	}
	
	/**
	 * Creates a record session if there wasn't one created already.
	 * @param conference name of a BigBlueButton conference
	 * @param room name of a room
	 * @param sessionName name of a session
	 */
	public void createRecordSession(String conference, String room, String sessionName) {
		RecorderSession session;
		RecorderEventDispatcher recorder=null;
		boolean createdSession = false;
		log.debug("Trying to create a record session for {}",sessionName);
		synchronized (this) {
			log.debug("Checking if record session $sessionName is already present.");
			if (recordSessions == null) {
				log.debug("record session is null");
			} else {
				log.debug("record session is NOT null");
			}
			
			if (! recordSessions.containsKey(sessionName)) {
				log.debug("Creating jms recorder for "+conference+" "+room);
				recorder = new RecorderEventDispatcher(conference, room);
				log.debug("Creating record session for {}",sessionName);
				session = new RecorderSession(conference, room);
				log.debug("Adding record session {} to record sessions",sessionName);
				recordSessions.put(session.getName(), session);	
				log.debug("Setting recorder to record session {}",sessionName);
				session.setRecorder(recorder);
				createdSession = true;
				log.debug("Created record session {}",session.getName());
			} else {
				log.debug("Not creating record session");
			}
		}
		if (createdSession) {			
			recorder.setJmsTemplate(jmsTemplate);
		}		
	}
	
	/**
	 * Add a recorder type. this can be a chat, presentation, participants event recorder
	 * @param sessionName session name
	 * @param recorder a event recorder
	 * @see IEventRecorder
	 */
	public void addEventRecorder(String sessionName, IEventRecorder recorder) {
		if (recordSessions.containsKey(sessionName)) {
			log.debug("Adding event recorder to session {}.",sessionName);
			RecorderSession session = recordSessions.get(sessionName);
			session.addEventRecorder(recorder);
		} else {
			log.debug("Not adding event recorder to session {}.",sessionName);
		}
	}
	
	/**
	 * Sets a jms template for the queue of events generated. This method is used in the bbb-apps.xml.
	 * @param jmsTemplate the JMS Template
	 */
	public void setJmsTemplate(JmsTemplate jmsTemplate){
		log.debug("Setting JmsTemplate");
		this.jmsTemplate = jmsTemplate;
	}
}

