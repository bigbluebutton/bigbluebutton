package org.bigbluebutton.web.controllers

import grails.testing.web.controllers.ControllerUnitTest
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.domain.Meeting
import org.bigbluebutton.api.domain.UserSession
import spock.lang.Specification

/**
 * Covers checkFileUploadAuthorization, the auth_request endpoint that decides
 * whether an uploaded image may be served. Authorization is by meeting family:
 * the meetingId in the requested path and the caller's session must share the
 * same root meeting (a breakout's root is its parent), so an image is reachable
 * from the main room and from any of its breakouts, but never across unrelated
 * meetings.
 */
class ConnectionControllerSpec extends Specification implements ControllerUnitTest<ConnectionController> {

  // Meeting family used across the specs: one main room and two breakouts.
  private static final String MAIN_MEETING_ID = 'main-x'
  private static final String BREAKOUT_1_ID = 'brk-1'
  private static final String BREAKOUT_2_ID = 'brk-2'

  MeetingService meetingService

  def setup() {
    meetingService = Mock(MeetingService)
    controller.meetingService = meetingService
  }

  // A valid session always resolves a UserSession and is not gated by the
  // in-memory session map, so the tests drive straight into the family check.
  private void withValidSession(String sessionMeetingId) {
    meetingService.getUserSessionWithSessionToken(_) >> userSessionFor(sessionMeetingId)
    meetingService.getAllowRequestsWithoutSession(_) >> true
  }

  private UserSession userSessionFor(String meetingId) {
    UserSession us = new UserSession()
    us.meetingID = meetingId
    return us
  }

  private Meeting meetingStub(boolean breakout, String internalId, String parentId) {
    Meeting m = Stub(Meeting)
    m.isBreakout() >> breakout
    m.getInternalId() >> internalId
    m.getParentMeetingId() >> parentId
    return m
  }

  private void requestUri(String meetingIdInPath) {
    request.addHeader('x-original-uri',
      "/bigbluebutton/fileUpload/${meetingIdInPath}/deadbeef-0000.png?sessionToken=tok123")
  }

  def "valid token and same-meeting path is authorized (200)"() {
    given: "the caller's session and the requested path are the same main meeting"
    withValidSession(MAIN_MEETING_ID)
    Meeting main = meetingStub(false, MAIN_MEETING_ID, null)
    meetingService.getMeeting(MAIN_MEETING_ID) >> main

    when:
    requestUri(MAIN_MEETING_ID)
    controller.checkFileUploadAuthorization()

    then:
    response.status == 200
    response.text == 'authorized'
  }

  def "valid token but a path in a different meeting family is forbidden (403)"() {
    given: "session is in main-a, the path points at unrelated main-b"
    withValidSession('main-a')
    meetingService.getMeeting('main-a') >> meetingStub(false, 'main-a', null)
    meetingService.getMeeting('main-b') >> meetingStub(false, 'main-b', null)

    when:
    requestUri('main-b')
    controller.checkFileUploadAuthorization()

    then:
    response.status == 403
    response.text == 'forbidden'
  }

  def "invalid token is unauthorized (401)"() {
    given: "the session token resolves to no user session"
    meetingService.getUserSessionWithSessionToken(_) >> null
    meetingService.getAllowRequestsWithoutSession(_) >> false

    when:
    requestUri(MAIN_MEETING_ID)
    controller.checkFileUploadAuthorization()

    then:
    response.status == 401
    response.text == 'unauthorized'
  }

  def "malformed meetingId in the path is rejected (403)"() {
    given: "the session is valid, but the path tries to traverse out of the uploads tree"
    withValidSession(MAIN_MEETING_ID)

    when: "the URI does not match the strict fileUpload pattern"
    request.addHeader('x-original-uri',
      '/bigbluebutton/fileUpload/../etc/passwd?sessionToken=tok123')
    controller.checkFileUploadAuthorization()

    then: "it never reaches a meeting lookup"
    response.status == 403
    response.text == 'forbidden'
    0 * meetingService.getMeeting(_)
  }

  def "sibling breakouts of the same parent are authorized (200)"() {
    given: "session is in breakout brk-1, the file lives in sibling breakout brk-2, both under main-x"
    withValidSession(BREAKOUT_1_ID)
    meetingService.getMeeting(BREAKOUT_1_ID) >> meetingStub(true, BREAKOUT_1_ID, MAIN_MEETING_ID)
    meetingService.getMeeting(BREAKOUT_2_ID) >> meetingStub(true, BREAKOUT_2_ID, MAIN_MEETING_ID)

    when:
    requestUri(BREAKOUT_2_ID)
    controller.checkFileUploadAuthorization()

    then: "cross-breakout transitivity: both roots resolve to main-x"
    response.status == 200
    response.text == 'authorized'
  }

  def "a file uploaded in the main room is reachable from its breakout (200)"() {
    given: "session is in breakout brk-1, the file lives in the parent main-x"
    withValidSession(BREAKOUT_1_ID)
    meetingService.getMeeting(BREAKOUT_1_ID) >> meetingStub(true, BREAKOUT_1_ID, MAIN_MEETING_ID)
    meetingService.getMeeting(MAIN_MEETING_ID) >> meetingStub(false, MAIN_MEETING_ID, null)

    when:
    requestUri(MAIN_MEETING_ID)
    controller.checkFileUploadAuthorization()

    then:
    response.status == 200
    response.text == 'authorized'
  }

  def "an unknown meeting in the path is forbidden, not a server error (403)"() {
    given: "the path meeting cannot be resolved"
    withValidSession(MAIN_MEETING_ID)
    meetingService.getMeeting(MAIN_MEETING_ID) >> meetingStub(false, MAIN_MEETING_ID, null)
    meetingService.getMeeting('gone') >> null

    when:
    requestUri('gone')
    controller.checkFileUploadAuthorization()

    then:
    response.status == 403
    response.text == 'forbidden'
  }

  def "a missing original URI header is unauthorized (401)"() {
    when: "nginx did not forward x-original-uri"
    controller.checkFileUploadAuthorization()

    then:
    response.status == 401
    response.text == 'unauthorized'
  }
}
