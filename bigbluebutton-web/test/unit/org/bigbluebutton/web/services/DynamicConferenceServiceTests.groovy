package org.bigbluebutton.web.services;

import groovy.util.GroovyTestCase;


class DynamicConferenceServiceTests extends GroovyTestCase {
	
    protected void setUp() {
        super.setUp()
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testIsValidMeetingId() {
    	DynamicConferenceService service = new DynamicConferenceService()
		assertTrue(service.isValidMeetingId("test-meeting"))
		assertFalse(service.isValidMeetingId("test meeting"))
		assertFalse(service.isValidMeetingId("test.meeting-valid name"))
    }
	
	void testProcessMeetingInfo() {
		Map params = new LinkedHashMap()
		params.put("ext_sakai_server", "http://192.168.0.60:8080");
		params.put("oauth_nonce", "2936012982701750");
		params.put("oauth_consumer_key", "fred");
		params.put("context_label", "BasicLTI Test");
		
	}
	
}

/*
    	DynamicConference conf = new DynamicConference("Test Conf", "abc", "123", "456", 30);
    	service.storeConference(conf);

    	assertEquals(conf, service.getConferenceByMeetingID("abc"));

    	assertNull(service.getConferenceByMeetingID("abd"));
    	assertNull(service.getConferenceByMeetingID(conf.getMeetingToken()));

    	assertNull(service.getConferenceByMeetingID("abcd"));

    	assertEquals(conf, service.getConferenceByMeetingID("abc"));
*/