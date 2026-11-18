package org.bigbluebutton.web.controllers

import grails.testing.web.controllers.ControllerUnitTest
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.ParamsProcessorUtil
import org.bigbluebutton.api.messaging.messages.PresentationUploadToken
import org.bigbluebutton.presentation.imp.SlidesGenerationProgressNotifier
import spock.lang.Specification

/**
 * bbb-apps-akka creates a presentation when it issues the upload token, and shows it as
 * uploading until something ends that upload. These cover the two ends only bbb-web can see:
 * an upload request that is refused once its token is spent, and a token no request arrives for.
 */
class PresentationUploadFailureSpec extends Specification implements ControllerUnitTest<PresentationController> {

  static final String TOKEN = 'PresUploadToken-abc123DEFAULT_PRESENTATION_POD-w_uploader'

  MeetingService meetingService
  List<String> failedUploads = []

  def setup() {
    def paramsProcessorUtil = new ParamsProcessorUtil()
    paramsProcessorUtil.setMaxPresentationFileUpload(30000000L)
    controller.paramsProcessorUtil = paramsProcessorUtil

    meetingService = new MeetingService()
    meetingService.setSlidesGenerationProgressNotifier(new SlidesGenerationProgressNotifier() {
      @Override
      void sendUploadFailedMessage(PresentationUploadToken token, String errorDetail) {
        failedUploads << token.presentationId
      }

      @Override
      void sendUploadFileTooLargeMessage(PresentationUploadToken token, int uploadedFileSize, int maxUploadFileSize) {
      }
    })
    controller.meetingService = meetingService
  }

  /** Upload tokens arrive from akka-apps; this registers one the way that message does. */
  private PresentationUploadToken register(String token, String presentationId, String userId = 'w_uploader') {
    def presUploadToken = new PresentationUploadToken('DEFAULT_PRESENTATION_POD', token, 'slides.pdf', 'meeting-1', presentationId, userId)
    meetingService.uploadAuthzTokens[token] = presUploadToken
    presUploadToken
  }

  private void authorizeUpload(String token) {
    request.addHeader('x-presentation-token', token)
    request.addHeader('x-original-content-length', '1000')
    controller.checkPresentationBeforeUploading()
  }

  // A body cut short reaches the action with no parameters at all, the meeting id included.
  def "An upload request that arrives without its parameters is reported as failed"() {
    given:
    register(TOKEN, 'pres-1')
    request.requestURI = "/bigbluebutton/presentation/${TOKEN}/upload"

    when:
    controller.upload()

    then:
    response.status == 403
    failedUploads == ['pres-1']
    !meetingService.authzTokenIsValid(TOKEN)
  }

  def "An upload request for another meeting is reported as failed"() {
    given:
    register(TOKEN, 'pres-1')
    request.requestURI = "/bigbluebutton/presentation/${TOKEN}/upload"
    params.conference = 'meeting-2'

    when:
    controller.upload()

    then:
    response.status == 403
    failedUploads == ['pres-1']
  }

  def "A request with an unknown token reports nothing"() {
    given:
    request.requestURI = "/bigbluebutton/presentation/${TOKEN}/upload"

    when:
    controller.upload()

    then:
    response.status == 403
    failedUploads.isEmpty()
  }

  def "A token no upload request arrived for in time is dropped and reported as failed"() {
    given:
    register(TOKEN, 'pres-1')
    meetingService.setPresentationUploadStartTimeout(0)

    when:
    meetingService.purgePresentationUploadTokens()

    then:
    failedUploads == ['pres-1']
    !meetingService.authzTokenIsValid(TOKEN)

    when: 'the purge runs again'
    meetingService.purgePresentationUploadTokens()

    then:
    failedUploads == ['pres-1']
  }

  def "A token is kept while the client still has time to start sending"() {
    given:
    register(TOKEN, 'pres-1')
    meetingService.setPresentationUploadStartTimeout(60)

    when:
    meetingService.purgePresentationUploadTokens()

    then:
    failedUploads.isEmpty()
    meetingService.authzTokenIsValid(TOKEN)
  }

  // The request is authorized as it arrives and handled only once its body is complete, which
  // for a large file on a slow connection can be long after the token was issued.
  def "A token whose upload request has arrived is kept however long the file takes"() {
    given:
    register(TOKEN, 'pres-1')
    meetingService.setPresentationUploadStartTimeout(0)

    when:
    authorizeUpload(TOKEN)
    meetingService.purgePresentationUploadTokens()

    then:
    response.status == 200
    failedUploads.isEmpty()
    meetingService.authzTokenIsValid(TOKEN)
  }

  def "A request refused before its upload starts does not keep the token alive"() {
    given:
    register(TOKEN, 'pres-1')
    meetingService.setPresentationUploadStartTimeout(0)
    request.addHeader('x-presentation-token', TOKEN)
    request.addHeader('x-original-content-length', '0')

    when:
    controller.checkPresentationBeforeUploading()
    meetingService.purgePresentationUploadTokens()

    then:
    response.status == 403
    failedUploads == ['pres-1']
  }

  // bbb-apps-akka issues these before the file is rendered, which can take minutes.
  def "The token of a system upload is never dropped"() {
    given:
    register(TOKEN, 'pres-1', PresentationUploadToken.SYSTEM_USER_ID)
    meetingService.setPresentationUploadStartTimeout(0)

    when:
    meetingService.purgePresentationUploadTokens()

    then:
    failedUploads.isEmpty()
    meetingService.authzTokenIsValid(TOKEN)
  }
}
