package org.bigbluebutton.pbx.asterisk;

import org.asteriskjava.fastagi.AgiChannel;
import org.asteriskjava.fastagi.AgiException;
import org.asteriskjava.fastagi.AgiRequest;
import org.asteriskjava.fastagi.AgiScript;
import org.asteriskjava.fastagi.AgiHangupException
import org.bigbluebutton.domain.Conference

class FindConferenceAgi implements AgiScript {

    private long _10_minutes = 10*60*1000
        
    def void service(AgiRequest request, AgiChannel channel)
            throws AgiException {

       	def number = request.getParameter("conference")
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
				println "CONFERENCE_FOUND=$number"
				channel.setVariable("CONFERENCE_FOUND", number)
			} else {
				println ("CONFERENCE_FOUND=")
				channel.setVariable("CONFERENCE_FOUND", "0")
			}
		} else {
			println ("CONFERENCE_INVALID=TRUE")
			channel.setVariable("CONFERENCE_FOUND", "0")
		}
    } 
}