package org.bigbluebutton.web.controllers

import grails.testing.web.controllers.ControllerUnitTest
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.domain.UserSession
import spock.lang.Specification

/**
 * Coverage for `ConnectionController#checkAuthorization` and `#legacyCheckAuthorization`, the
 * nginx auth_request checks that read the session token from the x-original-uri header: a
 * request without a usable token is refused with 401, a known token is let through.
 */
class ConnectionControllerSpec extends Specification implements ControllerUnitTest<ConnectionController> {

  static final String TOKEN = 'abcdefghijklmnop'

  def setup() {
    def userSession = new UserSession()
    userSession.authToken = TOKEN
    userSession.internalUserId = 'w_1'
    userSession.meetingID = 'meeting-1'
    userSession.voicebridge = '70000'
    userSession.fullname = 'Test User'

    // The real service, so a lookup with a null token fails the way it does in production.
    def meetingService = new MeetingService()
    meetingService.addUserSession(TOKEN, userSession)
    controller.meetingService = meetingService
  }

  def "#action refuses a request without the x-original-uri header"() {
    when:
    controller."$action"()

    then:
    noExceptionThrown()
    response.status == 401
    response.text == 'unauthorized'

    where:
    action << ['checkAuthorization', 'legacyCheckAuthorization']
  }

  def "#action refuses #uri"() {
    given:
    request.addHeader('x-original-uri', uri)

    when:
    controller."$action"()

    then:
    noExceptionThrown()
    response.status == 401
    response.text == 'unauthorized'

    where:
    [action, uri] << [
      ['checkAuthorization', 'legacyCheckAuthorization'],
      ['/bbb-webrtc-sfu?sessionToken=', '/bbb-webrtc-sfu?sessionToken=%', '/bbb-webrtc-sfu?sessionToken=unknown']
    ].combinations()
  }

  def "#action lets a known session token through"() {
    given: "the HTTP session that /join opened for the token"
    session[TOKEN] = TOKEN
    request.addHeader('x-original-uri', "/bbb-webrtc-sfu?sessionToken=${TOKEN}")

    when:
    controller."$action"()

    then:
    response.status == 200
    response.text == 'authorized'

    where:
    action << ['checkAuthorization', 'legacyCheckAuthorization']
  }
}
