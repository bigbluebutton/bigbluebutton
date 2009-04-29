package org.bigbluebutton.web.controllers

import org.bigbluebutton.web.domain.Conference
import org.bigbluebutton.web.domain.User
import org.bigbluebutton.web.domain.ScheduledSession
import org.jsecurity.crypto.hash.Sha1Hash

class ScheduleSessionControllerTests extends GroovyTestCase {
	def CONFERENCE_NAME = 'test-conference'
	def USERNAME = "admin@test.com"
	def USER_PASSWORD = "admin"
	def USER_FULLNAME = "Admin User"
	    	
	void testCreateConference() {    	
	  	// Let's create a user to own the conference
	   	def adminUser = new User(username:USERNAME , passwordHash: new Sha1Hash(USER_PASSWORD).toHex(),
				fullName: USER_FULLNAME).save()
		assertEquals 1, adminUser.id
		assertEquals USERNAME, adminUser.username
					
		def c = new Conference()
	  	c.createdBy = adminUser.fullName
	  	c.updatedBy = adminUser.fullName
	  	c.name = CONFERENCE_NAME
	  	c.user = adminUser
	  	c.save()
	  	
	   	assertEquals 1, Conference.list().size()
	   	def conf = Conference.findByName(CONFERENCE_NAME)    	
	   	assertEquals CONFERENCE_NAME, conf.name
	   	assertEquals adminUser.id, conf.user.id
	   	
	   	def ssc = new ScheduledSessionController()
	   	ssc.session["userid"] = adminUser.id
	  	ssc.params.conferenceId = conf.id
		ssc.params.name = 'test-conference-schedule'
		ssc.params.duration = 2
		ssc.params.record = true
		ssc.params.passwordProtect = true
		ssc.params.hostPassword = 'TestMostPassword'
		ssc.params.moderatorPassword = 'TestModeratorPassword'
		ssc.params.attendeePassword = 'TestAttendeePassword'
		
		ssc.save()
		assertEquals 1, ScheduledSession.list().size()
	   	conf = Conference.get(conf.id)    	
	   	println conf.sessions
	   	
	}
}
