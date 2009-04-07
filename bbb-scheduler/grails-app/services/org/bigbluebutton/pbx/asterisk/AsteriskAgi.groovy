package org.bigbluebutton.pbx.asterisk;

import org.asteriskjava.fastagi.AgiChannel;
import org.asteriskjava.fastagi.AgiException;
import org.asteriskjava.fastagi.AgiRequest;
import org.asteriskjava.fastagi.AgiScript;
import org.asteriskjava.fastagi.AgiHangupException
import org.bigbluebutton.domain.Conference

class AsteriskAgi implements AgiScript {

    private int tries = 0
    private long _10_minutes = 10*60*1000
        
    def void service(AgiRequest request, AgiChannel channel)
            throws AgiException {
        
        tries = 0
        boolean found = false
        try {
	        while ((tries < 3).and(!found)) {	           
				def number = channel.getData("conf-getconfno", 10000, 10)
				println "you entered $number"
			
				def conf = Conference.findByConferenceNumber(number)
	
				if (conf) { 
					println "found one! " + conf.conferenceName
					
					def startTime = conf.startDateTime.time - _10_minutes				
					def endTime = conf.startDateTime.time + conf.lengthOfConference*60*60*1000 + _10_minutes				
					def now = new Date()
					
					println "startTime " + new Date(startTime)
					println "endTime " + new Date(endTime)
					println "now " + now
					
					if ((startTime < now.time) && (endTime > now.time)) {				
						channel.streamFile("conf-placeintoconf")
						channel.exec("Meetme", "$number|dMq")
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
           	println "Channel has hangup"
        }
    } 

}