/* BigBlueButton - http://www.bigbluebutton.org
 * 
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
 * @author Jeremy Thomerson <jthomerson@genericconf.com>
 * @version $Id: $
 */
package org.bigbluebutton.api.domain;

import org.apache.commons.lang.RandomStringUtils;
import java.util.UUID;

import org.apache.commons.lang.StringUtils;
import org.bigbluebutton.web.domain.Conference;

public class DynamicConference extends Conference {

	Date startTime;
	Date endTime;
	
	String meetingID
	String meetingToken
	
	String moderatorPassword
	String attendeePassword

	int maxParticipants

	public DynamicConference() {
		
	}
	public DynamicConference(name, meetingID, attendeePW, moderatorPW, maxParticipants) {
		this.setName(name)
		this.setMeetingID(StringUtils.isEmpty(meetingID) ? "" : meetingID)
		this.setAttendeePassword(attendeePW == null ? createPassword() : attendeePW)
		this.setModeratorPassword(moderatorPW == null ? createPassword() : moderatorPW)
		this.setMaxParticipants(maxParticipants == null || maxParticipants < 0 ? -1 : maxParticipants)
		this.setMeetingToken(createMeetingToken())
	}

	public static String createMeetingToken() {
		return UUID.randomUUID().toString()
	}

	public static String createPassword() {
		return RandomStringUtils.randomAlphanumeric(8).toLowerCase();
	}

	public boolean isRunning() {
		boolean running = startTime != null && endTime == null;
		println "running: ${running}; startTime: ${startTime}; endTime: ${endTime}"; 
		return running;
	}

	String toString() {"DynamicConference: ${this.meetingToken} [${this.meetingID}]:${this.name}"}

}