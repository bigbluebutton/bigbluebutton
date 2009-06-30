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
import org.jsecurity.crypto.hash.Sha1Hash
import org.bigbluebutton.web.domain.Role
import org.bigbluebutton.web.domain.User
import org.bigbluebutton.web.domain.UserRoleRel
import org.bigbluebutton.web.domain.ScheduledSession
import org.bigbluebutton.web.domain.Conference
import java.util.UUID

class BootStrap {
	def jmsContainer
	
     def init = { servletContext ->
     	log.debug "Bootstrapping bbb-web"
     	// Administrator user and role.
     	log.debug "Creating administrator"
		def adminRole = new Role(name: "Administrator").save()
		def adminUser = new User(username: "admin@test.com", passwordHash: new Sha1Hash("admin").toHex(),
									fullName: "Admin")
		adminUser.save(flush:true)
		new UserRoleRel(user: adminUser, role: adminRole).save(flush:true)
		
		def userRole = new Role(name: "User").save()
		
		String createdBy = adminUser.fullName
		String modifiedBy = adminUser.fullName
		
		log.debug "Creating default conference"
		def defaultConference = new Conference(
				name:"Default Conference", conferenceNumber:new Integer(85115), 
				user:adminUser, createdBy:createdBy, updatedBy:modifiedBy).save()
//     	defaultConference.save()
		
		log.debug "Creating a Default session for the Default Conference"
		
		String name = "Default Conference Session"
		String description = "Default session -- use password (no quotes): 'mp' for Moderator, 'ap' for Attendee."
		String sessionId = UUID.randomUUID()
		String tokenId = UUID.randomUUID()
		Integer numberOfAttendees = new Integer(3)
		Boolean timeLimited = true
		Date startDateTime = new Date()
     	
     	// Set the endDate for this session to Dec. 31, 2010
     	java.util.Calendar calendar = java.util.Calendar.getInstance();
     	calendar.set(java.util.Calendar.MONTH, java.util.Calendar.DECEMBER);
     	calendar.set(java.util.Calendar.DAY_OF_MONTH, 31);
     	calendar.set(java.util.Calendar.YEAR, 2010)
     	
		Date endDateTime = calendar.getTime()
		
		Boolean record = false
		Boolean passwordProtect = true
		String hostPassword = 'hp'
		String moderatorPassword = 'mp'
		String attendeePassword = 'ap'
		String voiceConferenceBridge = '85115'
		
		def defaultConfSession = new ScheduledSession(
				name:name, description:description,
				createdBy:createdBy, modifiedBy:modifiedBy, sessionId:sessionId, tokenId:tokenId,
				numberOfAttendees:numberOfAttendees, timeLimited:timeLimited, startDateTime:startDateTime,
				endDateTime:endDateTime, record:record, passwordProtect:passwordProtect, hostPassword:hostPassword,
				moderatorPassword:moderatorPassword, attendeePassword:attendeePassword, 
				voiceConferenceBridge:voiceConferenceBridge, conference:defaultConference
			).save()
//     	defaultConfSession.save()		
     }
     
     def destroy = {
     }
} 
