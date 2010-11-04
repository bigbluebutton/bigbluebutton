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
import org.bigbluebutton.web.services.DynamicConferenceService

 
public class AsteriskAgiService implements AgiScript {
	 static transactional = false
    private long _10_minutes = 10*60*1000
    def dynamicConferenceService
    
    public void service(AgiRequest request, AgiChannel channel)
            throws AgiException {
        
        def number = request.getParameter("conference")
        if (dynamicConferenceService.isMeetingWithVoiceBridgeExist(number)) {
            channel.setVariable("CONFERENCE_FOUND", number)
        } else {
            channel.setVariable("CONFERENCE_FOUND", "0")
        }    	
    }
}