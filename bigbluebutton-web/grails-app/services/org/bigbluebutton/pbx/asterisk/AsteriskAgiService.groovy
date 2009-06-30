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
package org.bigbluebutton.pbx.asterisk

import org.asteriskjava.fastagi.AgiChannel
import org.asteriskjava.fastagi.AgiException
import org.asteriskjava.fastagi.AgiHangupException
import org.asteriskjava.fastagi.AgiRequest
import org.asteriskjava.fastagi.AgiScript

import java.util.Calendar

import org.bigbluebutton.web.domain.ScheduledSession

class AsteriskAgiService implements AgiScript {

    private int tries = 0
    private long _10_minutes = 10*60*1000
    
    def conferenceRecordingDir = "/var/spool/asterisk/meetme"
    
    public void service(AgiRequest request, AgiChannel channel)
            throws AgiException {
        try {
	        tries = 0
	        boolean found = false
	        while ((tries < 3).and(!found)) {
	            
				def number = channel.getData("conf-getconfno", 10000, 10)
				log.debug "The user pressed $number "
			
				def conf = ScheduledSession.findByVoiceConferenceBridge(number)
	
				if (conf) { 
					def startTime = conf.startDateTime.time - _10_minutes				
					def endTime = conf.endDateTime.time + _10_minutes				
					def now = new Date().time
					
					if ((startTime < now) && (endTime > now)) {				
						channel.streamFile("conf-placeintoconf")
						
						/**
						 * # 'c' — announce user(s) count on joining a conference
						 * # 'd' — dynamically add conference
						 * # 'M' — enable music on hold when the conference has a single caller
						 * # 'q' — quiet mode (don't play enter/leave sounds)
						 * # 'r' — Record conference
						 * # 's' — Present menu (user or admin) when '*' is received ('send' to menu)
						 * # 'T' — set talker detection (sent to manager interface and meetme list)
						 */
						 def RECORD_OPTION = ""
						 if (conf.record) {
							 log.debug "Recording voice conference"
							 RECORD_OPTION = "r"
							 def recordedFile = "/var/spool/asterisk/meetme/${now}-${number}-conf-record"
							 log.debug "Recording voice conference $recordedFile"
							 channel.setVariable("MEETME_RECORDINGFILE", recordedFile)
						 } else {
							 log.debug "Not recording voice conference"
						 }
						
						def OPTIONS = "cdMqs${RECORD_OPTION}T"
						
						channel.exec("Meetme", "$number|$OPTIONS")
						found = true
					} else {
						channel.streamFile("conference")
						channel.streamFile("is")
						channel.streamFile("unavailable")
					}
				} else {
					channel.streamFile("conf-invalid")
				}
				tries++
			}
			channel.streamFile("goodbye")
        } catch (AgiHangupException e) {
        	log.debug "User has hangup"
        }
    } 
}