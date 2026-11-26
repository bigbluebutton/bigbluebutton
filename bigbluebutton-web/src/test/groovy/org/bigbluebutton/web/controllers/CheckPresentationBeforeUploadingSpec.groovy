package org.bigbluebutton.web.controllers

import grails.testing.web.controllers.ControllerUnitTest
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.ParamsProcessorUtil
import org.bigbluebutton.api.messaging.messages.PresentationUploadToken
import org.bigbluebutton.presentation.InsertPagesIntent
import spock.lang.Specification

/**
 * Coverage for `PresentationController#checkPresentationBeforeUploading`, the nginx
 * auth_request for presentation uploads: 403 refuses the upload, and the x-file-too-large
 * header turns that into a 413 for the client.
 */
class CheckPresentationBeforeUploadingSpec extends Specification implements ControllerUnitTest<PresentationController> {

  static final long MAX_UPLOAD = 30000000L
  static final String TOKEN = 'PRESUPLOADTOKEN-1'
  static final String INSERT_TOKEN = 'PRESUPLOADTOKEN-INSERT'

  StubMeetingService meetingService

  def setup() {
    def paramsProcessorUtil = new ParamsProcessorUtil()
    paramsProcessorUtil.setMaxPresentationFileUpload(MAX_UPLOAD)
    controller.paramsProcessorUtil = paramsProcessorUtil

    meetingService = new StubMeetingService()
    meetingService.tokens[TOKEN] = new PresentationUploadToken('pod-1', TOKEN, 'slides.pdf', 'meeting-1', 'pres-1', 'w_uploader')
    meetingService.tokens[INSERT_TOKEN] = new PresentationUploadToken('pod-1', INSERT_TOKEN, 'more.pdf', 'meeting-1', 'pres-2',
        'w_uploader', new InsertPagesIntent('pres-1', 3, 10, true, 'page-of-the-request'))
    controller.meetingService = meetingService
  }

  /** Upload tokens arrive from akka-apps; this registers them directly and records the replies. */
  static class StubMeetingService extends MeetingService {
    Map<String, PresentationUploadToken> tokens = [:]
    List<PresentationUploadToken> tooLargeMessages = []
    List<String> consumed = []
    List<List> insertProgress = []
    List<List> insertFailed = []

    @Override
    PresentationUploadToken consumePresentationUploadToken(String authzToken) {
      consumed << authzToken
      authzToken == null ? null : tokens.remove(authzToken)
    }

    @Override
    void sendInsertPagesProgress(PresentationUploadToken token, String stage) {
      insertProgress << [token.presentationId, stage]
    }

    @Override
    void sendInsertPagesFailed(PresentationUploadToken token, String detail) {
      insertFailed << [token.presentationId, detail]
    }

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

  def "A token of an insert of pages with an acceptable size reports the start of the transfer"() {
    given:
    request.addHeader('x-presentation-token', INSERT_TOKEN)
    request.addHeader('x-original-content-length', '1000')

    when:
    controller.checkPresentationBeforeUploading()

    then:
    response.status == 200
    response.text == 'upload-success'
    meetingService.insertProgress == [['pres-2', 'transfer']]
    meetingService.insertFailed.isEmpty()
    meetingService.consumed.isEmpty()
  }

  def "A token of an insert of pages with a file over the limit is used up and fails the insert"() {
    given:
    request.addHeader('x-presentation-token', INSERT_TOKEN)
    request.addHeader('x-original-content-length', String.valueOf(MAX_UPLOAD + 1))

    when:
    controller.checkPresentationBeforeUploading()

    then:
    response.status == 403
    response.getHeader('x-file-too-large') == '1'
    meetingService.consumed == [INSERT_TOKEN]
    !meetingService.tokens.containsKey(INSERT_TOKEN)
    meetingService.insertFailed*.get(0) == ['pres-2']
    meetingService.tooLargeMessages.isEmpty()
    meetingService.insertProgress.isEmpty()
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
