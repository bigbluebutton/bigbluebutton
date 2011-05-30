package org.bigbluebutton.web.controllers

import grails.test.*
import org.bigbluebutton.web.services.DynamicConferenceService;
import org.apache.commons.codec.digest.DigestUtils;
import org.bigbluebutton.api.*;

class ApiControllerTests extends ControllerUnitTestCase {
    protected void setUp() {
        super.setUp()
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testIndex() {
		ApiController controller = new ApiController()
		def service = new DynamicConferenceService()
		service.apiVersion = "0.7"
		controller.setDynamicConferenceService(service)		
		controller.index()
		println "controller response = " + controller.response.contentAsString
    }
	
	void testCreateAPI() {
		String securitySalt = 'ab56fda9fc1c2bde2d65ff76134b47ad'
		String mId = "CULB"
		String mName = "CULB"
		String modPass = "testm"
		String viewPass = "testa"
		
		String queryString = "meetingID=${mId}&name=${mName}&moderatorPW=${modPass}&attendeePW=${viewPass}"
		String checksum = DigestUtils.shaHex("create" + queryString + securitySalt)
		queryString += "&checksum=${checksum}"
		
		mockParams.meetingID = mId
		mockParams.checksum = checksum
		mockParams.name = mName
		mockParams.moderatorPW = modPass
		mockParams.attendeePW = viewPass
		mockRequest.queryString = queryString
		
		ApiController controller = new ApiController()
		mockLogging(DynamicConferenceService)
		def service = new DynamicConferenceService()
		service.setMeetingService(new MeetingServiceImp()) 
		service.apiVersion = "0.7"
		service.securitySalt = 'ab56fda9fc1c2bde2d65ff76134b47ad'
		
		controller.setDynamicConferenceService(service)
		controller.create()
		println "controller response = " + controller.response.contentAsString
	}
	
}