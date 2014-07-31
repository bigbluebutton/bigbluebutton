package org.bigbluebutton.web.controllers

//import grails.test.*

import org.bigbluebutton.api.ParamsProcessorUtil;
import org.bigbluebutton.api.RecordingService;
import org.apache.commons.codec.digest.DigestUtils;
import org.bigbluebutton.api.*;
import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.domain.User;
import org.bigbluebutton.api.messaging.NullMessagingService;
import org.bigbluebutton.api.messaging.MessagingService;

class ApiControllerTests {//extends ControllerUnitTestCase {
	final String API_VERSION = "0.81"
	final boolean SERVICE_ENABLED = true;
	final String SALT = 'ab56fda9fc1c2bde2d65ff76134b47ad'
	final int DEF_MAX_USERS = 20
	final String DEF_WELCOME_MSG = "<br>Welcome to this BigBlueButton Demo Server.<br><br>For help using BigBlueButton <a href=\"event:http://www.bigbluebutton.org/content/videos\"><u>check out these videos</u></a>.<br><br>"
	final String DEF_DIAL_NUMER = "613-555-1234"
	final String TEST_VOICE_BRIDGE = "9999"
	final String TEST_CONF_MOCK = "conference-mock-default"
	final String DEF_LOGOUT_URL = ""
	final String DEF_SERVER_URL = "http://192.168.0.166"
	final int DEF_NUM_FOR_VOICE = 5;
	final String DEF_CLIENT_URL = "http://localhost/client/BigBlueButton.html"
	final int DEF_MEETING_DURATION = 210;

	String MEETING_ID = "default-meeting-id"
	String MEETING_NAME = "Default Meeting"
	String MOD_PASS = "modpass"
	String VIEW_PASS = "viewpass"
	long CREATE_TIME = 1234567890
	
	RecordingService recordingService
	MeetingService meetingService
	ParamsProcessorUtil ppu = new ParamsProcessorUtil();
	
    protected void setUp() {
        super.setUp()
		mockLogging(RecordingService)
		recordingService = new RecordingService()
		meetingService = new MeetingService()
		MessagingService ms = new NullMessagingService();
		meetingService.setMessagingService(ms);
		
		ppu.setApiVersion(API_VERSION)
		ppu.setSecuritySalt(SALT);
		ppu.setDefaultNumDigitsForTelVoice(5)
		ppu.setDefaultClientUrl(DEF_CLIENT_URL)
		ppu.setDefaultMeetingDuration(DEF_MEETING_DURATION);
		ppu.setDefaultDialAccessNumber(DEF_DIAL_NUMER);
		ppu.setDefaultMaxUsers(DEF_MAX_USERS);
		ppu.setDefaultLogoutUrl(DEF_LOGOUT_URL);
		ppu.setDefaultWelcomeMessage(DEF_WELCOME_MSG);
		ppu.setServiceEnabled(SERVICE_ENABLED);
		ppu.setTestConferenceMock(TEST_CONF_MOCK);
		ppu.setTestVoiceBridge(VIEW_PASS);
		
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testIndex() {
		ApiController controller = new ApiController()
		mockLogging(ApiController)
		controller.setMeetingService(meetingService)	
		controller.setParamsProcessorUtil(ppu);	
		controller.index()
		println "controller response = " + controller.response.contentAsString
    }
	
	void testCreateAPI() {		
		ApiController controller = new ApiController()
		mockLogging(ApiController)
		controller.setMeetingService(meetingService)	
		controller.setParamsProcessorUtil(ppu);
		createMeeting(controller)
		controller.create()
		
		println "controller response = " + controller.response.contentAsString
	}

	void testJoinAPI() {		
		/**
		 * Now that the meeting has been setup. Try to join it.
		 */		
		ApiController controller = new ApiController()
		mockLogging(ApiController)
		controller.setMeetingService(meetingService)	
		controller.setParamsProcessorUtil(ppu);
		// Create a conference. This prevents us from calling the CREATE API
		meetingService.createMeeting(createDefaultMeeting())
		
		joinMeeting(controller)
		controller.join()
		println "controller response = " + controller.response.contentAsString
		/**
		 * Need to use controller2.redirectArgs['url'] instead of controller2.response.redirectedUrl as
		 * shown in the grails doc because it is returning null for me.
		 * 
		 * see http://kousenit.wordpress.com/2010/11/10/unit-testing-grails-controllers-revisited/
		 */
		assertEquals DEF_CLIENT_URL, controller.redirectArgs['url']		
	}

	void testIsMeetingRunningAPI() {				
		ApiController controller = new ApiController()
		mockLogging(ApiController)
		controller.setMeetingService(meetingService)
		controller.setParamsProcessorUtil(ppu);
		// Create a conference. This prevents us from calling the CREATE API
		meetingService.createMeeting(createDefaultMeeting())
		
		isMeetingRunning(controller)
		controller.isMeetingRunning()
		println "controller response = " + controller.response.contentAsString
	}
	
	
	void testEndAPI() {		
		ApiController endCtlr = new ApiController()
		mockLogging(ApiController)
		endCtlr.setMeetingService(meetingService)
		endCtlr.setParamsProcessorUtil(ppu);
		// Create a conference. This prevents us from calling the CREATE API
		meetingService.createMeeting(createDefaultMeeting())
		
		endMeeting(endCtlr)
		endCtlr.end()
		println "controller response = " + endCtlr.response.contentAsString		
	}
	
	void testGetMeetingInfo() {
		ApiController gmiCtlr = new ApiController()
		mockLogging(ApiController)
		gmiCtlr.setMeetingService(meetingService)
		gmiCtlr.setParamsProcessorUtil(ppu);
		// Create a conference. This prevents us from calling the CREATE API
		Meeting m = createDefaultMeeting()
		// Add a user.
		User u = new User("test-user", "Test User", "MODERATOR");
		m.userJoined(u);
		meetingService.createMeeting(m)
		
		getMeetingInfo(gmiCtlr)
		gmiCtlr.getMeetingInfo()
		println "controller response = " + gmiCtlr.response.contentAsString		
	}
	
	void testGetMeetings() {
		ApiController gmCtlr = new ApiController()
		mockLogging(ApiController)
		gmCtlr.setMeetingService(meetingService)
		gmCtlr.setParamsProcessorUtil(ppu);
		// Create a conference. This prevents us from calling the CREATE API
		Meeting m = createDefaultMeeting()
		// Add a user.
		User u = new User("test-user", "Test User", "MODERATOR");
		m.userJoined(u);
		meetingService.createMeeting(m)
		
		// Create another meeting
		meetingService.createMeeting(createAnotherMeeting());
		
		getMeetings(gmCtlr)
		gmCtlr.getMeetings()
		println "controller response = " + gmCtlr.response.contentAsString		
	}

	void testGetRecordings() {
		ApiController recCtlr = new ApiController()
		mockLogging(ApiController)
		recCtlr.setMeetingService(meetingService)
		recCtlr.setParamsProcessorUtil(ppu);

		String queryString = ""
		String checksum = DigestUtils.shaHex("getRecordings" + queryString + SALT)
		queryString += "&checksum=${checksum}"
			
		mockParams.checksum = checksum
		mockRequest.queryString = queryString

		recCtlr.getRecording()
		println "controller response = " + recCtlr.response.contentAsString
		
	}
	
	/***********************************************************************
	 * Helper methods
	 */

	private Meeting createDefaultMeeting() {
		
		String internalMeetingId = ppu.convertToInternalMeetingId(MEETING_ID)
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

		Meeting defaultMeeting = new Meeting.Builder(MEETING_ID, internalMeetingId, CREATE_TIME).withName(MEETING_NAME)
							.withMaxUsers(30).withModeratorPass(MOD_PASS).withViewerPass(VIEW_PASS).withRecording(true)
							.withLogoutUrl(logoutUrl).withTelVoice(telVoice).withWebVoice(webVoice).withDialNumber(dialNumber)
							.withMetadata(mInfo).withWelcomeMessage(welcomeMessage).build()
							
		return defaultMeeting;
	}
	
	private Meeting createAnotherMeeting() {
		String externalMeetingId = "cook-with-omar"
		String internalMeetingId = ppu.convertToInternalMeetingId(externalMeetingId)
		String logoutUrl = "http://localhost"
		String telVoice = "85116"
		String webVoice = "bbb-85116"
		String dialNumber = "6135551234"
		String welcomeMessage = "Welcome to Another Meeting. Todays topic is Cooking with Chef Omar"
		Map<String, String> mInfo = new HashMap<String, String>();
		mInfo.put('title', "Omar's Lebanese Cuisine");
		mInfo.put('subject', "OLC 101");
		mInfo.put('description', "How to make the perfect shawarma.");
		mInfo.put('creator', "Richard Alam");
		mInfo.put('contributor', "Popen3");
		mInfo.put('language', "en-US");
		mInfo.put('identifier', "olc-101-2");
		long createTime = 1234567899
		Meeting defaultMeeting = new Meeting.Builder("cook-with-omar", internalMeetingId, createTime).withName("Omar's Cooking")
							.withMaxUsers(30).withModeratorPass(MOD_PASS).withViewerPass(VIEW_PASS).withRecording(true)
							.withLogoutUrl(logoutUrl).withTelVoice(telVoice).withWebVoice(webVoice).withDialNumber(dialNumber)
							.withMetadata(mInfo).withWelcomeMessage(welcomeMessage).build()
							
		return defaultMeeting;
	}

	private void getMeetings(ApiController controller) {
		String queryString = ""
		String checksum = DigestUtils.shaHex("getMeetings" + queryString + SALT)
		queryString += "&checksum=${checksum}"
		
		mockParams.checksum = checksum
		mockRequest.queryString = queryString
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
	
	private void joinMeeting(ApiController controller) {
		String username = "Richard"
		String modPass = "testm"
		
		String queryString = "meetingID=${MEETING_ID}&fullName=${username}&password=${MOD_PASS}&createTime=${CREATE_TIME}"
		String checksum = DigestUtils.shaHex("join" + queryString + SALT)
		queryString += "&checksum=${checksum}"
		
		mockParams.fullName = username
		mockParams.meetingID = MEETING_ID
		mockParams.password = MOD_PASS
		mockParams.checksum = checksum
		mockParams.createTime = CREATE_TIME
		mockRequest.queryString = queryString
	}
	
	private void createMeeting(ApiController controller) {
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