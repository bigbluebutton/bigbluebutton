package org.bigbluebutton.pbx.asterisk;

import org.asteriskjava.fastagi.AgiChannel;
import org.asteriskjava.fastagi.AgiException;
import org.asteriskjava.fastagi.AgiRequest;
import org.asteriskjava.fastagi.AgiScript;

import java.util.Calendar

/*
import groovy.lang.Binding;
import groovy.sql.Sql;
import groovy.util.GroovyScriptEngine;
import groovy.util.ResourceException;
import groovy.util.ScriptException;

import java.io.IOException;
import java.sql.SQLException;
import javax.sql.DataSource;
*/

import Conference;

class AsteriskAgi implements AgiScript {

//    private GroovyScriptEngine gse
//    private Sql db
    
//    private DataSource dataSource
    
    	
//    def void setDataSource(DataSource source) {
//    	dataSource = source;
//    	db = new Sql(dataSource);
//    }
    
    private int tries = 0
    private long _10_minutes = 10*60*1000
        
    def void service(AgiRequest request, AgiChannel channel)
            throws AgiException {
        
        tries = 0
        boolean found = false
        while ((tries < 3).and(!found)) {
            
			def number = channel.getData("conf-getconfno", 10000, 10)
			println "you entered "
			println "$number new"
		
			def conf = Conference.findByConferenceNumber(number)

			if (conf) { 
				println "found one! " + conf.conferenceName
				
				def startTime = conf.startDateTime.time - _10_minutes				
				def endTime = conf.startDateTime.time + conf.lengthOfConference*60*60*1000 + _10_minutes				
				def now = new Date().time
				
				if ((startTime < now) && (endTime > now)) {				
					channel.streamFile("conf-placeintoconf")
					channel.exec("Meetme", "$number|dMq")
					found = true
				} else {
/*					if (now < startTime) {
						def time = new Calendar(conf.startDateTime)
						def hr = time.get(Calendar.HOUR)
						def min = time.get(Calendar.MINUTE)
						def am_pm = time.get(Calendar.AM_PM)
						
						channel.streamFile("conference")
						channel.streamFile("is-at")
						channel.streamFile("digits/" + hr)
						channel.streamFile("digits/" + min)
						if (am_pm == Calendar.AM) {
							channel.streamFile("digits/a-m")
						} else {
							channel.streamFile("digits/p-m")
						}
*/						channel.streamFile("conference")
						channel.streamFile("is")
						channel.streamFile("unavailable")
						break;
//					}
				}
			} else {
				channel.streamFile("conf-invalid")
			}
			tries++
		}
		channel.streamFile("goodbye")
    } 

}