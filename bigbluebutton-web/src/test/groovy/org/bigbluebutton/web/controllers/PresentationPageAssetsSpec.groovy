package org.bigbluebutton.web.controllers

import grails.testing.web.controllers.ControllerUnitTest
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.domain.UserSession
import org.bigbluebutton.web.services.PresentationService
import spock.lang.Specification
import spock.lang.Unroll

import java.nio.file.Files

/**
 * The page asset actions (svg, thumbnail, png, text) and the slide authorization identify a page by
 * its page id: an id in any other format is answered 404 before the page token is checked.
 */
class PresentationPageAssetsSpec extends Specification implements ControllerUnitTest<PresentationController> {

  static final String SESSION = 'session-token-1'
  static final String MEETING = 'meeting-1'
  static final String PRES = 'pres-1'
  static final String PAGE_ID = '3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e'
  static final List<String> ACTIONS = ['showSvgImage', 'showThumbnail', 'showPng', 'showTextfile']

  File presentationDir

  static class StubMeetingService extends MeetingService {
    @Override
    UserSession getUserSessionWithSessionToken(String token) {
      if (token != SESSION) return null
      def us = new UserSession()
      us.meetingID = MEETING
      return us
    }

    @Override
    Boolean getAllowRequestsWithoutSession(String token) { true }
  }

  def setup() {
    presentationDir = Files.createTempDirectory('presentation-assets').toFile()
    controller.meetingService = new StubMeetingService()
    controller.presentationService = new PresentationService(presentationDir: presentationDir.absolutePath)
  }

  def cleanup() {
    presentationDir.deleteDir()
  }

  private void requestPage(String id) {
    params.sessionToken = SESSION
    params.conference = MEETING
    params.room = MEETING
    params.presentation_name = PRES
    params.id = id
  }

  @Unroll
  def "#action answers 404 to page id '#id' with pageTokenSecret '#secret'"() {
    given:
    controller.presentationService.pageTokenSecret = secret
    requestPage(id)

    when:
    controller."$action"()

    then:
    response.status == 404

    where:
    [action, secret, id] << [ACTIONS, [null, 'secret'], ['2', "${PRES}/2", PAGE_ID.toUpperCase()]].combinations()
  }

  @Unroll
  def "#action checks the page token of a well formed page id"() {
    given:
    controller.presentationService.pageTokenSecret = 'secret'
    requestPage(PAGE_ID)

    when:
    controller."$action"()

    then:
    response.status == 403

    where:
    action << ACTIONS
  }

  def "showSvgImage serves the svg named by the page id"() {
    given:
    def svg = new File(presentationDir, "${MEETING}/${MEETING}/${PRES}/svgs/slide${PAGE_ID}.svg")
    svg.parentFile.mkdirs()
    svg.text = '<svg/>'
    requestPage(PAGE_ID)

    when:
    controller.showSvgImage()

    then:
    response.status == 200
    response.text == '<svg/>'
  }

  @Unroll
  def "Slide authorization of #path is #expected"() {
    given:
    controller.presentationService.pageTokenSecret = null
    request.addHeader('x-original-uri', "/bigbluebutton/presentation/${MEETING}/${MEETING}/${PRES}/${path}?sessionToken=${SESSION}")

    when:
    controller.checkPresentationAuthorization()

    then:
    response.status == expected

    where:
    path                     || expected
    "svg/${PAGE_ID}"         || 200
    "thumbnail/${PAGE_ID}"   || 200
    'svg/2'                  || 403
    'svg/0000000000000000000000000000000000ab' || 403
  }
}
