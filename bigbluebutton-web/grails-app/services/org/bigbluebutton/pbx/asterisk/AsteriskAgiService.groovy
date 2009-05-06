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
							 RECORD_OPTION = "r"
							 channel.setVariable("MEETME_RECORDINGFILE", "$conferenceRecordingDir/$now-$number-conf-record")
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