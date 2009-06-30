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
package org.bigbluebutton.web.domain

class ScheduledSession implements Comparable {
	Date dateCreated
	Date lastUpdated
	String createdBy
	String modifiedBy
	
	String name
	String description
	/* The id for this session. This can be used as the conference room in Red5, for example. */
	String sessionId
	/* An id that we can use in the URL to join this conference session */
	String tokenId
	Integer numberOfAttendees = new Integer(3)
	/* Is there a time limit for this session? */
	Boolean timeLimited = true
	Date startDateTime
	/* If there is a time limit, until when? */
	Date endDateTime
	/* Is this session going to be recorded? */
	Boolean record = false
	/* Do we require a password to join this session? */
	Boolean passwordProtect = true
	String hostPassword = 'change-me-please'
	String moderatorPassword = 'change-me-please'
	String attendeePassword = 'change-me-please'
	String voiceConferenceBridge
	
	Date getCurrentTime() { new Date() }
	static transients = ['currentTime']
	
	public ScheduledSession() {
		startDateTime = new Date()
		// Set the end to 1 hour after start
		endDateTime = new Date(startDateTime.time + 60*60*1000)
	}
	
	Conference conference
			
	static constraints = {		
		name(maxLength:50, blank:false)
		tokenId(blank:false)
		sessionId(blank:false)
		numberOfAttendees()
	}
	
	String toString() {"${this.id}:${this.name} - ${this.sessionId} ${this.tokenId}"}

    int compareTo(obj) {
        obj.id.compareTo(id)
    }
}
