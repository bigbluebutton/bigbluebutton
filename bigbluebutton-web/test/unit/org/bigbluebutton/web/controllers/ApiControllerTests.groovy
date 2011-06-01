package org.bigbluebutton.web.controllers

import grails.test.*
import org.bigbluebutton.web.services.DynamicConferenceService;
import org.apache.commons.codec.digest.DigestUtils;
import org.bigbluebutton.api.*;
import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.domain.User;

class ApiControllerTests extends ControllerUnitTestCase {
	String API_VERSION = "0.7"
	String SALT = 'ab56fda9fc1c2bde2d65ff76134b47ad'
	String MEETING_ID = "default-meeting-id"
	String MEETING_NAME = "Default Meeting"
	String MOD_PASS = "modpass"
	String VIEW_PASS = "viewpass"
	String CLIENT_URL = "http://localhost/client/BigBlueButton.html"

	
	def dynamicConferenceService
	MeetingServiceImp meetingService
	
    protected void setUp() {
        super.setUp()
		mockLogging(DynamicConferenceService)
		dynamicConferenceService = new DynamicConferenceService()
		meetingService = new MeetingServiceImp()
		dynamicConferenceService.setMeetingService(meetingService)
		dynamicConferenceService.apiVersion = API_VERSION
		dynamicConferenceService.securitySalt = SALT
		dynamicConferenceService.defaultNumDigitsForTelVoice = 5
		dynamicConferenceService.defaultNumDigitsForTelVoice = 5
		dynamicConferenceService.defaultClientUrl = CLIENT_URL
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testIndex() {
		ApiController controller = new ApiController()
		mockLogging(ApiController)
		controller.setDynamicConferenceService(dynamicConferenceService)		
		controller.index()
		println "controller response = " + controller.response.contentAsString
    }
	
	void testCreateAPI() {		
		ApiController controller = new ApiController()
		mockLogging(ApiController)
		controller.setDynamicConferenceService(dynamicConferenceService)		
		createConference(controller)
		controller.create()
		
		println "controller response = " + controller.response.contentAsString
	}

	void testJoinAPI() {		
		/**
		 * Now that the meeting has been setup. Try to join it.
		 */		
		ApiController controller2 = new ApiController()
		mockLogging(ApiController)
		controller2.setDynamicConferenceService(dynamicConferenceService)
		
		// Create a conference. This prevents us from calling the CREATE API
		dynamicConferenceService.createConference(createDefaultMeeting())
		
		joinConference(controller2)
		controller2.join()
		
		/**
		 * Need to use controller2.redirectArgs['url'] instead of controller2.response.redirectedUrl as
		 * shown in the grails doc because it is returning null for me.
		 * 
		 * see http://kousenit.wordpress.com/2010/11/10/unit-testing-grails-controllers-revisited/
		 */
		assertEquals CLIENT_URL, controller2.redirectArgs['url']		
	}

	void testIsMeetingRunningAPI() {		
		
		ApiController controller3 = new ApiController()
		mockLogging(ApiController)
		controller3.setDynamicConferenceService(dynamicConferenceService)
		
		// Create a conference. This prevents us from calling the CREATE API
		dynamicConferenceService.createConference(createDefaultMeeting())
		
		isMeetingRunning(controller3)
		controller3.isMeetingRunning()
		println "controller response = " + controller3.response.contentAsString
	}
	
	
	void testEndAPI() {
		
		ApiController endCtlr = new ApiController()
		mockLogging(ApiController)
		endCtlr.setDynamicConferenceService(dynamicConferenceService)
		
		// Create a conference. This prevents us from calling the CREATE API
		dynamicConferenceService.createConference(createDefaultMeeting())
		
		endMeeting(endCtlr)
		endCtlr.end()
		println "controller response = " + endCtlr.response.contentAsString
		
	}
	
	void testGetMeetingInfo() {
		ApiController gmiCtlr = new ApiController()
		mockLogging(ApiController)
		gmiCtlr.setDynamicConferenceService(dynamicConferenceService)
		
		// Create a conference. This prevents us from calling the CREATE API
		Meeting m = createDefaultMeeting()
		// Add a user.
		User u = new User("test-user", "Test User", "MODERATOR");
		m.userJoined(u);
		dynamicConferenceService.createConference(m)
		
		getMeetingInfo(gmiCtlr)
		gmiCtlr.getMeetingInfo()
		println "controller response = " + gmiCtlr.response.contentAsString
		
	}
	
	/***********************************************************************
	 * Helper methods
	 */

	private Meeting createDefaultMeeting() {
		
		String internalMeetingId = dynamicConferenceService.getInternalMeetingId(MEETING_ID)
		String logoutUrl = "http://localhost"
		String telVoice = "85115"
		String webVoice = "bbb-85115"
		String dialNumber = "6135551234"
		String welcomeMessage = "Welcome to TTMG 5001. Todays topic is Business Ecosystem"
		Map<String, String> mInfo = new HashMap<String, String>();
		mInfo.put('title', "Business Ecosystem");
		mInfo.put('subject', "TTMG 5001");
		mInfo.put('description', "How to manage your product's ecosystem");
		mInfo.put('creator', "Richard Alam");
		mInfo.put('contributor', "Popen3");
		mInfo.put('language', "en-US");
		mInfo.put('identifier', "ttmg-5001-2");
		
		Meeting defaultMeeting = new Meeting.Builder().withName(MEETING_NAME).withExternalId(MEETING_ID).withInternalId(internalMeetingId)
							.withMaxUsers(30).withModeratorPass(MOD_PASS).withViewerPass(VIEW_PASS).withRecording(true)
							.withLogoutUrl(logoutUrl).withTelVoice(telVoice).withWebVoice(webVoice).withDialNumber(dialNumber)
							.withMetadata(mInfo).withWelcomeMessage(welcomeMessage).build()
							
		return defaultMeeting;
	}

	private void getMeetingInfo(ApiController controller) {
		String queryString = "meetingID=${MEETING_ID}&password=${MOD_PASS}"
		String checksum = DigestUtils.shaHex("getMeetingInfo" + queryString + SALT)
		queryString += "&checksum=${checksum}"
		
		mockParams.meetingID = MEETING_ID
		mockParams.password = MOD_PASS
		mockParams.checksum = checksum
		mockRequest.queryString = queryString
	}
	
	private void endMeeting(ApiController controller) {		
		String queryString = "meetingID=${MEETING_ID}&password=${MOD_PASS}"
		String checksum = DigestUtils.shaHex("end" + queryString + SALT)
		queryString += "&checksum=${checksum}"
		
		mockParams.meetingID = MEETING_ID
		mockParams.password = MOD_PASS
		mockParams.checksum = checksum
		mockRequest.queryString = queryString
	}

		
	private void isMeetingRunning(ApiController controller) {		
		String queryString = "meetingID=${MEETING_ID}"
		String checksum = DigestUtils.shaHex("isMeetingRunning" + queryString + SALT)
		queryString += "&checksum=${checksum}"
		
		mockParams.meetingID = MEETING_ID
		mockParams.checksum = checksum
		mockRequest.queryString = queryString
	}
	
	private void joinConference(ApiController controller) {
		String username = "Richard"
		String modPass = "testm"
		
		String queryString = "meetingID=${MEETING_ID}&fullName=${username}&password=${MOD_PASS}"
		String checksum = DigestUtils.shaHex("join" + queryString + SALT)
		queryString += "&checksum=${checksum}"
		
		mockParams.fullName = username
		mockParams.meetingID = MEETING_ID
		mockParams.password = MOD_PASS
		mockParams.checksum = checksum
		mockRequest.queryString = queryString
	}
	
	private void createConference(ApiController controller) {
		String queryString = "meetingID=${MEETING_ID}&name=${MEETING_NAME}&moderatorPW=${MOD_PASS}&attendeePW=${VIEW_PASS}"
		String checksum = DigestUtils.shaHex("create" + queryString + SALT)
		queryString += "&checksum=${checksum}"
		
		mockParams.meetingID = MEETING_ID
		mockParams.checksum = checksum
		mockParams.name = MEETING_NAME
		mockParams.moderatorPW = MOD_PASS
		mockParams.attendeePW = VIEW_PASS
		mockRequest.queryString = queryString
	}
}