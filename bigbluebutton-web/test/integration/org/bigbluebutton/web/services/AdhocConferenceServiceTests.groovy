package org.bigbluebutton.web.services

import grails.test.*
import org.bigbluebutton.presentation.service.AdhocConference

class AdhocConferenceServiceTests extends GrailsUnitTestCase {
    protected void setUp() {
        super.setUp()
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testConferenceRoomExist() {
    	AdhocConferenceService service = new AdhocConferenceService()
    	service.createConference('85115');
    	
    	assertTrue service.conferenceExistWithVoiceBridge('85115')
    }
    
    void testConferenceExistWithModeratorToken() {
    	AdhocConferenceService service = new AdhocConferenceService()
    	AdhocConference conf = new AdhocConference('85115', 'test-room', 'modToken', 'attToken')
    	service.createConference(conf);
    	
    	assertTrue service.conferenceExistWithModeratorToken('modToken')
    }

    void testGetConferenceExistWithModeratorToken() {
    	AdhocConferenceService service = new AdhocConferenceService()
    	AdhocConference conf = new AdhocConference('85115', 'test-room', 'modToken', 'attToken')
    	service.createConference(conf);
    	
    	AdhocConference conf1 = service.getConferenceWithModeratorToken('modToken')
    	assertEquals conf1.moderatorToken, 'modToken'
    }
    
    void testGetConferenceWithAttendeeToken() {
    	AdhocConferenceService service = new AdhocConferenceService()
    	AdhocConference conf = new AdhocConference('85115', 'test-room', 'modToken', 'attToken')
    	service.createConference(conf);
    	
    	AdhocConference conf1 = service.getConferenceWithAttendeeToken('attToken')
    	assertEquals conf1.attendeeToken, 'attToken'
    }
}
