package org.bigbluebutton.web.controllers

import grails.testing.web.controllers.ControllerUnitTest
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.ParamsProcessorUtil
import org.bigbluebutton.api.messaging.messages.PresentationUploadToken
import spock.lang.Specification

/**
 * Coverage for `PresentationController#checkPresentationBeforeUploading`, the nginx
 * auth_request for presentation uploads: 403 refuses the upload, and the x-file-too-large
 * header turns that into a 413 for the client.
 */
class CheckPresentationBeforeUploadingSpec extends Specification implements ControllerUnitTest<PresentationController> {

  static final long MAX_UPLOAD = 30000000L
  static final String TOKEN = 'PRESUPLOADTOKEN-1'

  StubMeetingService meetingService

  def setup() {
    def paramsProcessorUtil = new ParamsProcessorUtil()
    paramsProcessorUtil.setMaxPresentationFileUpload(MAX_UPLOAD)
    controller.paramsProcessorUtil = paramsProcessorUtil

    meetingService = new StubMeetingService()
    meetingService.tokens[TOKEN] = new PresentationUploadToken('pod-1', TOKEN, 'slides.pdf', 'meeting-1', 'pres-1')
    controller.meetingService = meetingService
  }

  /** Upload tokens arrive from akka-apps; this registers them directly and records the replies. */
  static class StubMeetingService extends MeetingService {
    Map<String, PresentationUploadToken> tokens = [:]
    List<PresentationUploadToken> tooLargeMessages = []

    @Override
    Boolean authzTokenIsValid(String authzToken) {
      authzToken != null && tokens.containsKey(authzToken)
    }

    @Override
    PresentationUploadToken getPresentationUploadToken(String authzToken) {
      authzToken == null ? null : tokens[authzToken]
    }

    @Override
    void sendPresentationUploadMaxFilesizeMessage(PresentationUploadToken token, int uploadedFileSize, int maxUploadFileSize) {
      tooLargeMessages << token
    }
  }

  def "A known token and an acceptable size allow the upload"() {
    given:
    request.addHeader('x-presentation-token', TOKEN)
    request.addHeader('x-original-content-length', '1000')

    when:
    controller.checkPresentationBeforeUploading()

    then:
    response.status == 200
    response.text == 'upload-success'
  }

  def "A known token with a file over the limit is refused as too large"() {
    given:
    request.addHeader('x-presentation-token', TOKEN)
    request.addHeader('x-original-content-length', String.valueOf(MAX_UPLOAD + 1))

    when:
    controller.checkPresentationBeforeUploading()

    then:
    response.status == 403
    response.getHeader('x-file-too-large') == '1'
    meetingService.tooLargeMessages*.presentationId == ['pres-1']
  }

  def "A missing or unknown token is refused without claiming the file is too large"() {
    given:
    if (token != null) {
      request.addHeader('x-presentation-token', token)
    }
    request.addHeader('x-original-content-length', '1000')

    when:
    controller.checkPresentationBeforeUploading()

    then:
    noExceptionThrown()
    response.status == 403
    response.getHeader('x-file-too-large') == null
    meetingService.tooLargeMessages.isEmpty()

    where:
    token << [null, 'NOT-A-TOKEN']
  }
}
