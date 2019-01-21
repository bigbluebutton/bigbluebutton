package org.bigbluebutton.web.controllers

import com.github.javafaker.Faker
import grails.testing.web.controllers.ControllerUnitTest
import groovy.json.JsonSlurper
import org.bigbluebutton.api.ApiParams
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.ParamsProcessorUtil
import org.bigbluebutton.presentation.PresentationUrlDownloadService
import org.bigbluebutton.web.services.PresentationService
import spock.lang.Specification

class ApiControllerSpec extends Specification implements ControllerUnitTest<ApiController> {

  Faker faker = new Faker()

  def apiVersion = "2.0"
  def securitySalt = "b4578c133b8a49acaecacbb3abec91a1"
  def defaultServerUrl = "http://127.0.0.1"
  def welcomeMessage = "<br>Welcome to <b>%%CONFNAME%%</b>!"

  def setupSpec() {}

  def setup() {
    // Find a better way by auto-wiring
    def paramsProcessorUtil = new ParamsProcessorUtil()
    paramsProcessorUtil.setApiVersion(apiVersion)
    paramsProcessorUtil.setSecuritySalt(securitySalt)
    paramsProcessorUtil.setDefaultServerUrl(defaultServerUrl)
    paramsProcessorUtil.setDefaultConfigURL(defaultServerUrl + "/client/conf/config.xml")
    paramsProcessorUtil.setDefaultWelcomeMessage(welcomeMessage)
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
  }

  def cleanup() {}

  def cleanupSpec() {}

  def xmlResponseToString() {
    new XmlSlurper().parseText(response.text).toString()
  }

  def jsonResponseToString() {
    new JsonSlurper().parseText(response.text).toString()
  }

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
    xmlResponseToString() == buildErrorResponse("checksumError", "You did not pass the checksum security check")
  }

  def "Test create a meeting without a meetingID"() {
    when: "meetingId is not provided"
    params[ApiParams.CHECKSUM] = faker.hashCode().toString()
    params[ApiParams.MEETING_ID] = null
    controller.create()

    then: "Respond and say that a meeting iD must be provided"
    xmlResponseToString() == buildErrorResponse("missingParamMeetingID", "You must specify a meeting ID for the meeting.")
  }

  def "Test create a meeting without an empty meetingID"() {
    when: "meetingId is provided but empty"
    params[ApiParams.CHECKSUM] = faker.hashCode().toString()
    params[ApiParams.MEETING_ID] = "     "
    controller.create()

    then: "Respond and say that a meeting iD must be provided"
    xmlResponseToString() == buildErrorResponse("missingParamMeetingID", "You must specify a meeting ID for the meeting.")
  }

  def "Test create a meeting with a wrong checksum"() {
    when: "meetingId is provided but empty"
    params[ApiParams.CHECKSUM] = faker.hashCode().toString()
    params[ApiParams.MEETING_ID] = faker.educator().course()
    controller.create()

    then: "Respond and say that a meeting iD must be provided"
    xmlResponseToString() == buildErrorResponse("checksumError", "You did not pass the checksum security check")
  }

  def "Test create a meeting with full parameters"() {
    when: "necessary meeting parameters are provided"
    params[ApiParams.ATTENDEE_PW] = "pw"
    params[ApiParams.DIAL_NUMBER] = "1-1111-1111"
    params[ApiParams.DURATION] = "60"
    params[ApiParams.MEETING_ID] = "UnitTesting"
    params["meta_config"] = "unitTesting"
    params["meta_server"] = "notHosted"
    params[ApiParams.MODERATOR_PW] = "mp"
    params[ApiParams.VOICE_BRIDGE] = "76120"
    params[ApiParams.CHECKSUM] = "1a5ae6e030ebeb7ad223308a1758789a61afca69"
    controller.create()

    then: "Respond and say that a meeting iD must be provided"
    xmlResponseToString() == buildCreateMeetingResponse(controller.meetingService.meetings.getAt(0))
  }

  /***********************************
   * HELPER METHODS
   ***********************************/

  def buildCreateMeetingResponse(meeting) {
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
        "<createDate>${formatPrettyDate(meeting.getCreateTime())}</createDate>" +
        "<hasUserJoined>false</hasUserJoined>" +
        "<duration>${params[ApiParams.DURATION]}</duration>" +
        "<hasBeenForciblyEnded>false</hasBeenForciblyEnded>" +
        "<messageKey></messageKey>" +
        "<message></message>" +
        "</response>")
    result.toString()
  }

  def buildErrorResponse(key, msg) {
    def result = new XmlSlurper().parseText("<response>" +
        "<returncode>${controller.RESP_CODE_FAILED}</returncode>" +
        "<messageKey>${key}</messageKey>" +
        "<message>${msg}</message>" +
        "</response>")
    result.toString()
  }

  def formatPrettyDate(timestamp) {
    return new Date(timestamp).toString()
  }
}
