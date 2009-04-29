package org.bigbluebutton.web.controllers

import org.bigbluebutton.web.domain.Conference
import org.jsecurity.crypto.hash.Sha1Hash
import org.bigbluebutton.web.domain.User

class ConferenceControllerTests extends GroovyTestCase {
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
				
		// setup our controller
		def cc = new ConferenceController()
    	// setup our mocked session
		cc.session["userid"] = adminUser.id
    	// mock the params that get's sent from the client
    	cc.params.name = CONFERENCE_NAME
    	// now save to create the conference
    	cc.save()
    	assertEquals 1, Conference.list().size()
    	def conf = Conference.findByName(CONFERENCE_NAME)    	
    	assertEquals CONFERENCE_NAME, conf.name
    	assertEquals adminUser.id, conf.user.id
    }
}
