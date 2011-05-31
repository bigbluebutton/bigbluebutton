package org.bigbluebutton.web.controllers

import grails.test.*
import org.bigbluebutton.web.services.DynamicConferenceService;
import org.apache.commons.codec.digest.DigestUtils;
import org.bigbluebutton.api.*;

class ApiControllerTests extends ControllerUnitTestCase {
	String SALT = 'ab56fda9fc1c2bde2d65ff76134b47ad'
	String MEETING_ID = "CULB"
	String MEETING_NAME = "CULB"
	String MOD_PASS = "testm"
	String VIEW_PASS = "testa"
	String CLIENT_URL = "http://localhost/client/BigBlueButton.html"
	
	
	def service
	
    protected void setUp() {
        super.setUp()
		mockLogging(DynamicConferenceService)
		service = new DynamicConferenceService()
		service.setMeetingService(new MeetingServiceImp())
		service.apiVersion = "0.7"
		service.securitySalt = SALT
		service.defaultNumDigitsForTelVoice = 5
		service.defaultNumDigitsForTelVoice = 5
		service.defaultClientUrl = CLIENT_URL
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
		String queryString = "meetingID=${MEETING_ID}&name=${MEETING_NAME}&moderatorPW=${MOD_PASS}&attendeePW=${VIEW_PASS}"
		String checksum = DigestUtils.shaHex("create" + queryString + SALT)
		queryString += "&checksum=${checksum}"
		
		mockParams.meetingID = MEETING_ID
		mockParams.checksum = checksum
		mockParams.name = MEETING_NAME
		mockParams.moderatorPW = MOD_PASS
		mockParams.attendeePW = VIEW_PASS
		mockRequest.queryString = queryString
		
		ApiController controller = new ApiController()
		
		mockLogging(ApiController)

		controller.setDynamicConferenceService(service)
		controller.create()
		println "controller response = " + controller.response.contentAsString
	}

	void testJoinAPI() {
		
		/** Create the meeting to set things up */
		String queryString = "meetingID=${MEETING_ID}&name=${MEETING_NAME}&moderatorPW=${MOD_PASS}&attendeePW=${VIEW_PASS}"
		String checksum = DigestUtils.shaHex("create" + queryString + SALT)
		queryString += "&checksum=${checksum}"
		
		mockParams.meetingID = MEETING_ID
		mockParams.checksum = checksum
		mockParams.name = MEETING_NAME
		mockParams.moderatorPW = MOD_PASS
		mockParams.attendeePW = VIEW_PASS
		mockRequest.queryString = queryString
		
		ApiController controller = new ApiController()
		mockLogging(ApiController)
		controller.setDynamicConferenceService(service)
		controller.create()
		
		String username = "Richard"
		String modPass = "testm"
		
		queryString = "meetingID=${MEETING_ID}&fullName=${username}&password=${MOD_PASS}"
		checksum = DigestUtils.shaHex("join" + queryString + SALT)
		queryString += "&checksum=${checksum}"
		
		mockParams.fullName = username
		mockParams.meetingID = MEETING_ID
		mockParams.password = MOD_PASS
		mockParams.checksum = checksum
		mockRequest.queryString = queryString
		
		ApiController controller2 = new ApiController()
		mockLogging(ApiController)
		controller2.setDynamicConferenceService(service)
		controller2.join()
		
		/**
		 * Need to use controller2.redirectArgs['url'] instead of controller2.response.redirectedUrl as
		 * shown in the grails doc because it is returning null for me.
		 * 
		 * see http://kousenit.wordpress.com/2010/11/10/unit-testing-grails-controllers-revisited/
		 */
		assertEquals CLIENT_URL, controller2.redirectArgs['url']		
	}
}