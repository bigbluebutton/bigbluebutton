package org.bigbluebutton.pbx.asterisk;

import org.asteriskjava.fastagi.AgiChannel;
import org.asteriskjava.fastagi.AgiException;
import org.asteriskjava.fastagi.AgiHangupException;
import org.asteriskjava.fastagi.AgiRequest;
import org.asteriskjava.fastagi.AgiScript;

import java.util.Calendar

import org.bigbluebutton.web.domain.ScheduledSession;

class AsteriskAgiService implements AgiScript {

    private int tries = 0
    private long _10_minutes = 10*60*1000
        
    def void service(AgiRequest request, AgiChannel channel)
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
						channel.setVariable("MEETME_RECORDINGFILE", "/var/spool/asterisk/meetme/$now-$number-conf-record")
						channel.exec("Meetme", "$number|cdMqsrT")
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