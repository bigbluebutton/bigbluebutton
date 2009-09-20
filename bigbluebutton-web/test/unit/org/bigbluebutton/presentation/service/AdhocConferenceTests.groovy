package org.bigbluebutton.presentation.service

import grails.test.*

class AdhocConferenceTests extends GrailsUnitTestCase {
    protected void setUp() {
        super.setUp()
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testCreateAdhocConference() {
    	def conf = new AdhocConference('85115', 'test-room', 'modToken', 'attToken')
    	assertEquals 'modToken', conf.moderatorToken
    }
}
