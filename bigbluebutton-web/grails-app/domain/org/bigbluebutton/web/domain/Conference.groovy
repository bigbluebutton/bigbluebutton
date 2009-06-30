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

class Conference implements Comparable {
	Date dateCreated
	Date lastUpdated
	String createdBy
	String updatedBy
	String name
	Integer conferenceNumber
	User user
	
	SortedSet sessions
	
	static hasMany = [sessions:ScheduledSession]
			
	static constraints = {
		name(maxLength:50, blank:false)
		conferenceNumber(unique:true, size:5..10)
	}

	String toString() {"${this.id}:${this.name} ${this.user}"}

    int compareTo(obj) {
       obj.id.compareTo(id)
   }

}


