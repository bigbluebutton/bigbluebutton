package org.bigbluebutton.web.controllers

import grails.testing.web.controllers.ControllerUnitTest
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.ParamsProcessorUtil
import org.bigbluebutton.api.messaging.messages.PresentationUploadToken
import org.bigbluebutton.presentation.imp.SlidesGenerationProgressNotifier
import org.bigbluebutton.web.services.UserCleanupTimerTask
import spock.lang.Specification

/**
 * bbb-apps-akka creates a presentation when it issues the upload token, and shows it as
 * uploading until something ends that upload. These cover the two ends only bbb-web can see:
 * an upload request that is refused once its token is spent, and a token no request arrives for.
 */
class PresentationUploadFailureSpec extends Specification implements ControllerUnitTest<PresentationController> {

  static final String TOKEN = 'PresUploadToken-abc123DEFAULT_PRESENTATION_POD-w_uploader'
  static final long START_TIMEOUT = 60

  MeetingService meetingService
  List<String> failedUploads = []

  def setup() {
    def paramsProcessorUtil = new ParamsProcessorUtil()
    paramsProcessorUtil.setMaxPresentationFileUpload(30000000L)
    controller.paramsProcessorUtil = paramsProcessorUtil

    meetingService = new MeetingService()
    meetingService.setPresentationUploadStartTimeout(START_TIMEOUT)
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

  private static long secondsFromNow(long seconds) {
    System.currentTimeMillis() + seconds * 1000
  }

  // nginx names the method of the request it asks about; method null leaves the header out
  private void authorizeUpload(String token, String method = 'POST') {
    request.addHeader('x-presentation-token', token)
    request.addHeader('x-original-content-length', '1000')
    if (method != null) {
      request.addHeader('x-original-method', method)
    }
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

    when:
    meetingService.purgePresentationUploadTokens(secondsFromNow(START_TIMEOUT + 1))

    then:
    failedUploads == ['pres-1']
    !meetingService.authzTokenIsValid(TOKEN)

    when: 'the purge runs again'
    meetingService.purgePresentationUploadTokens(secondsFromNow(START_TIMEOUT + 16))

    then:
    failedUploads == ['pres-1']
  }

  def "A token is kept while the client still has time to start sending"() {
    given:
    register(TOKEN, 'pres-1')

    when:
    meetingService.purgePresentationUploadTokens()
    meetingService.purgePresentationUploadTokens(secondsFromNow(START_TIMEOUT - 1))

    then:
    failedUploads.isEmpty()
    meetingService.authzTokenIsValid(TOKEN)
  }

  def "A start timeout of 0 turns the timeout off"() {
    given:
    register(TOKEN, 'pres-1')
    meetingService.setPresentationUploadStartTimeout(0)

    when:
    meetingService.purgePresentationUploadTokens()
    meetingService.purgePresentationUploadTokens(secondsFromNow(24 * 60 * 60))

    then:
    failedUploads.isEmpty()
    meetingService.authzTokenIsValid(TOKEN)
  }

  // The request is authorized as it arrives and handled only once its body is complete, which
  // for a large file on a slow connection can be long after the token was issued.
  def "A token whose upload request has arrived is kept however long the file takes"() {
    given:
    register(TOKEN, 'pres-1')

    when:
    authorizeUpload(TOKEN, method)
    meetingService.purgePresentationUploadTokens(secondsFromNow(60 * 60))

    then:
    response.status == 200
    failedUploads.isEmpty()
    meetingService.authzTokenIsValid(TOKEN)

    where: 'a request without the header is taken to be the upload'
    method << ['POST', null]
  }

  // The upload action answers POST only, so nothing else would ever consume the token.
  def "A request with another method does not keep the token alive"() {
    given:
    register(TOKEN, 'pres-1')

    when:
    authorizeUpload(TOKEN, method)
    meetingService.purgePresentationUploadTokens(secondsFromNow(START_TIMEOUT + 1))

    then:
    failedUploads == ['pres-1']
    !meetingService.authzTokenIsValid(TOKEN)

    where:
    method << ['GET', 'PUT', 'OPTIONS']
  }

  // The purge can drop the token between the validity check and the start being recorded.
  def "An upload request whose token is dropped as it arrives is refused"() {
    given:
    controller.meetingService = new MeetingService() {
      @Override
      Boolean authzTokenIsValid(String authzToken) { true }

      @Override
      boolean presentationUploadStarted(String authzToken) { false }
    }

    when:
    authorizeUpload(TOKEN)

    then:
    response.status == 403
    response.getHeader('x-file-too-large') == null
  }

  def "Recording the start of an upload fails for a token that is gone"() {
    expect:
    !meetingService.presentationUploadStarted(TOKEN)
    !meetingService.presentationUploadStarted(null)

    when:
    register(TOKEN, 'pres-1')

    then:
    meetingService.presentationUploadStarted(TOKEN)
  }

  // An exception that leaves the scheduled task ends its schedule for good.
  def "A user purge that throws does not stop the token purge"() {
    given:
    List<String> purges = []
    def timerTask = new UserCleanupTimerTask()
    timerTask.setMeetingService(new MeetingService() {
      @Override
      void purgeUsers() {
        purges << 'users'
        throw new NullPointerException('a user rejoined while being purged')
      }

      @Override
      void purgePresentationUploadTokens() { purges << 'tokens' }
    })

    when:
    new UserCleanupTimerTask.CleanupTask(timerTask).run()

    then:
    noExceptionThrown()
    purges == ['users', 'tokens']
  }

  def "A request refused before its upload starts does not keep the token alive"() {
    given:
    register(TOKEN, 'pres-1')
    request.addHeader('x-presentation-token', TOKEN)
    request.addHeader('x-original-content-length', '0')

    when:
    controller.checkPresentationBeforeUploading()
    meetingService.purgePresentationUploadTokens(secondsFromNow(START_TIMEOUT + 1))

    then:
    response.status == 403
    failedUploads == ['pres-1']
  }

  // bbb-apps-akka issues these before the file is rendered, which can take minutes.
  def "The token of a system upload is never dropped"() {
    given:
    register(TOKEN, 'pres-1', PresentationUploadToken.SYSTEM_USER_ID)

    when:
    meetingService.purgePresentationUploadTokens(secondsFromNow(60 * 60))

    then:
    failedUploads.isEmpty()
    meetingService.authzTokenIsValid(TOKEN)
  }
}
