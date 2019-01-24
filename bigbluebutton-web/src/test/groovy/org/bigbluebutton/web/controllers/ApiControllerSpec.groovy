package org.bigbluebutton.web.controllers

import com.github.javafaker.Faker
import grails.testing.web.controllers.ControllerUnitTest
import groovy.json.JsonSlurper
import org.apache.commons.codec.digest.DigestUtils
import org.bigbluebutton.api.ApiParams
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.ParamsProcessorUtil
import org.bigbluebutton.api.domain.Meeting
import org.bigbluebutton.api.domain.UserSession
import org.bigbluebutton.presentation.PresentationUrlDownloadService
import org.bigbluebutton.web.services.PresentationService
import spock.lang.Specification

class ApiControllerSpec extends Specification implements ControllerUnitTest<ApiController> {

  Faker faker = new Faker()

  def apiVersion = "2.0"
  def securitySalt = "b4578c133b8a49acaecacbb3abec91a1"
  def defaultServerUrl = "http://127.0.0.1"
  def welcomeMessage = "<br>Welcome to <b>%%CONFNAME%%</b>!"
  def logoutUrl = defaultServerUrl + "/api/logout"

  def setupSpec() {}

  def setup() {
    // Find a better way by auto-wiring
    def paramsProcessorUtil = new ParamsProcessorUtil()
    paramsProcessorUtil.setApiVersion(apiVersion)
    paramsProcessorUtil.setSecuritySalt(securitySalt)
    paramsProcessorUtil.setDefaultServerUrl(defaultServerUrl)
    paramsProcessorUtil.setDefaultConfigURL(defaultServerUrl + "/client/conf/config.xml")
    paramsProcessorUtil.setDefaultWelcomeMessage(welcomeMessage)
    paramsProcessorUtil.setDefaultLogoutUrl(logoutUrl)
    controller.paramsProcessorUtil = paramsProcessorUtil

    def meetingService = new MeetingService()
    controller.meetingService = meetingService
    controller.meetingService.paramsProcessorUtil = paramsProcessorUtil

    def presentationService = new PresentationService()
    presentationService.setDefaultUploadedPresentation(defaultServerUrl + "/default.pdf")
    controller.presentationService = presentationService

    def presDownloadService = new PresentationUrlDownloadService()
    presDownloadService.setBlankPresentation("/var/bigbluebutton/blank/blank-presentation.pdf")
    presDownloadService.setPresentationDir("tests")
    controller.presDownloadService = presDownloadService

    controller.REDIRECT_RESPONSE = false
  }

  def cleanup() {}

  def cleanupSpec() {}

  /***********************************
   * VERSION (API)
   ***********************************/

  def "Test API version"() {
    when: "The API version is executed"
    controller.index()

    then: "API version is returned"
    def expected = new XmlSlurper().parseText("<response><returncode>SUCCESS</returncode><version>" + apiVersion + "</version></response>")
    xmlResponseToString() == expected.toString()
  }

  /***********************************
   * CREATE (API)
   ***********************************/

  def "Test create a meeting wihtout a checksum"() {
    when: "A checksum is not provided"
    params[ApiParams.CHECKSUM] = null
    controller.create()

    then: "Respond and say no checksum has been provided"
    xmlResponseToString() == buildXmlErrorResponse("checksumError", "You did not pass the checksum security check")
  }

  def "Test create a meeting without a meetingID"() {
    when: "meetingId is not provided"
    params[ApiParams.CHECKSUM] = faker.hashCode().toString()
    params[ApiParams.MEETING_ID] = null
    controller.create()

    then: "Respond and say that a meeting iD must be provided"
    xmlResponseToString() == buildXmlErrorResponse("missingParamMeetingID", "You must specify a meeting ID for the meeting.")
  }

  def "Test create a meeting without an empty meetingID"() {
    when: "meetingId is provided but empty"
    params[ApiParams.CHECKSUM] = faker.crypto().sha1()
    params[ApiParams.MEETING_ID] = "     "
    controller.create()

    then: "Respond and say that a meeting iD must be provided"
    xmlResponseToString() == buildXmlErrorResponse("missingParamMeetingID", "You must specify a meeting ID for the meeting.")
  }

  def "Test create a meeting with a wrong checksum"() {
    when: "meetingId is provided but empty"
    params[ApiParams.CHECKSUM] = faker.hashCode().toString()
    params[ApiParams.MEETING_ID] = faker.educator().course()
    controller.create()

    then: "Respond and say that a meeting iD must be provided"
    xmlResponseToString() == buildXmlErrorResponse("checksumError", "You did not pass the checksum security check")
  }

  def "Test create a meeting with full parameters"() {
    when: "necessary meeting parameters are provided"
    createMeetingWithDefaultParameters()
    setChecksumAndQueryString('create')
    controller.create()

    then: "Respond and say that a meeting iD must be provided"
    xmlResponseToString() == buildCreateMeetingResponse(controller.meetingService.meetings.getAt(0))
  }

  def "Test join a non existing meeting"() {
    when: "a user tried to join a non-existing meeting"
    createJoinUser()
    setChecksumAndQueryString('join')
    controller.join()

    then: "Respond with a non-existing meeting"
    xmlResponseToString() == buildXmlErrorResponse("invalidMeetingIdentifier", "The meeting ID that you supplied did not match any existing meetings")
  }

  def "Test join an existing meeting"() {
    when: "A meeting is created"
    createMeetingWithDefaultParameters()
    setChecksumAndQueryString('create')
    controller.create()

    and: "a user joins the meeting"
    def mmetingId = params[ApiParams.MEETING_ID]
    def password = params[ApiParams.MODERATOR_PW]
    resetWebCall()

    createJoinUser(password)
    params[ApiParams.MEETING_ID] = mmetingId
    setChecksumAndQueryString('join')
    controller.join()

    then: "respond with a json array"
    // println "####### RRRRRRRR ${response.text}"
    // println "####### BBBBBBBB ${buildJoinMeetingResponse(controller.meetingService.meetings.getAt(0), controller.meetingService.sessions.getAt(0))}"
    joinXmlResponseToString() == buildJoinMeetingResponse(controller.meetingService.meetings.getAt(0), controller.meetingService.sessions.getAt(0))
  }

  /***********************************
   * RESPONSE BUILDERS METHODS
   ***********************************/

  def buildCreateMeetingResponse(Meeting meeting) {
    def result = new XmlSlurper().parseText("    <response>" +
        "<returncode>${controller.RESP_CODE_SUCCESS}</returncode>" +
        "<meetingID>${params[ApiParams.MEETING_ID]}</meetingID>" +
        "<internalMeetingID>${meeting.getInternalId()}</internalMeetingID>" +
        "<parentMeetingID>bbb-none</parentMeetingID>" +
        "<attendeePW>${params[ApiParams.ATTENDEE_PW]}</attendeePW>" +
        "<moderatorPW>${params[ApiParams.MODERATOR_PW]}</moderatorPW>" +
        "<createTime>${meeting.getCreateTime()}</createTime>" +
        "<voiceBridge>${params[ApiParams.VOICE_BRIDGE]}</voiceBridge>" +
        "<dialNumber>${params[ApiParams.DIAL_NUMBER]}</dialNumber>" +
        "<createDate>${formatPrettyDate(meeting.createTime)}</createDate>" +
        "<hasUserJoined>false</hasUserJoined>" +
        "<duration>${params[ApiParams.DURATION]}</duration>" +
        "<hasBeenForciblyEnded>false</hasBeenForciblyEnded>" +
        "<messageKey></messageKey>" +
        "<message></message>" +
        "</response>")
    result.toString()
  }

  def buildJoinMeetingResponse(Meeting meeting, UserSession us) {
    /* We remove `session_token` as we can't get it from code */
    def result = new XmlSlurper().parseText("<response>" +
        "<returncode>${controller.RESP_CODE_SUCCESS}</returncode>" +
        "<messageKey>guestDeny</messageKey>" +
        "<message>Guest denied to join meeting.</message>" +
        "<meeting_id>${meeting.internalId}</meeting_id>" +
        "<user_id>${us.internalUserId}</user_id>" +
        "<auth_token>${us.authToken}</auth_token>" +
        "<guestStatus>${us.guestStatus}</guestStatus>" +
        "<url>${us.logoutUrl}</url>" +
        "</response>")
    result.toString()
  }

  def buildXmlErrorResponse(key, msg) {
    def result = new XmlSlurper().parseText("<response>" +
        "<returncode>${controller.RESP_CODE_FAILED}</returncode>" +
        "<messageKey>${key}</messageKey>" +
        "<message>${msg}</message>" +
        "</response>")
    result.toString()
  }


  def buildJsonErrorResponse(key, msg) {
    def result = new JsonSlurper().parseText("[" +
        "  [" +
        "    {" +
        "      message: ${msg}," +
        "      key: $key {}" +
        "    }" +
        "  ]" +
        "]")
    result.toString()
  }

  /***********************************
   * HELPER METHODS
   ************************************/

  def createMeetingWithDefaultParameters() {
    params[ApiParams.ATTENDEE_PW] = faker.crypto().md5()
    params[ApiParams.DIAL_NUMBER] = faker.phoneNumber().phoneNumber()
    params[ApiParams.DURATION] = Objects.toString(faker.number().numberBetween(5, 120))
    params[ApiParams.MEETING_ID] = faker.educator().course()
    params[ApiParams.MODERATOR_PW] = faker.crypto().md5()
    params[ApiParams.VOICE_BRIDGE] = Objects.toString(faker.number().numberBetween(25000, 80000))
  }

  def createJoinUser(password) {
    params[ApiParams.MEETING_ID] = faker.educator().course()
    params[ApiParams.FULL_NAME] = faker.superhero().name()
    params[ApiParams.PASSWORD] = password
    params[ApiParams.REDIRECT] = "false"
  }

  def setChecksumAndQueryString(method) {
    def query = mapToQueryString()
    params[ApiParams.CHECKSUM] = getChecksum(method, query)
    request.setQueryString(query + "&" + ApiParams.CHECKSUM + "=" + params[ApiParams.CHECKSUM])
  }

  def resetWebCall() {
    params.clear()
    response.reset()
  }

  def mapToQueryString() {
    params.collect { k, v -> "${URLEncoder.encode(k, "UTF-8")}=${URLEncoder.encode(v, "UTF-8")} " }.join('&')
  }

  def getChecksum(method, query) {
    DigestUtils.sha1Hex(method + query + securitySalt)
  }

  def formatPrettyDate(timestamp) {
    return new Date(timestamp).toString()
  }

  def xmlResponseToString() {
    new XmlSlurper().parseText(response.text).toString()
  }

  def joinXmlResponseToString() {
    def xml = new XmlSlurper().parseText(response.text)
    xml.session_token.replaceNode {}
    xml.toString()
  }

  def jsonResponseToString() {
    new JsonSlurper().parseText(response.text).toString()
  }

}
