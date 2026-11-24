package org.bigbluebutton.web.filters

import jakarta.servlet.FilterChain
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.messaging.messages.PresentationUploadToken
import org.bigbluebutton.presentation.imp.SlidesGenerationProgressNotifier
import org.springframework.core.Ordered
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import spock.lang.Specification

/**
 * The upload action runs only once the whole file has arrived. Until then the filter is all that
 * knows the request: it keeps the token of a request that has reached bbb-web, and reports the
 * upload of a request that ends before the action took its token.
 */
class PresentationUploadFilterSpec extends Specification {

  static final String TOKEN = 'PresUploadToken-abc123DEFAULT_PRESENTATION_POD-w_uploader'
  static final String UPLOAD_URI = "/bigbluebutton/presentation/${TOKEN}/upload"
  static final long START_TIMEOUT = 60

  MeetingService meetingService
  PresentationUploadFilter filter
  List<String> failedUploads = []
  long receivedAt

  def setup() {
    meetingService = new MeetingService()
    meetingService.setPresentationUploadStartTimeout(START_TIMEOUT)
    meetingService.setSlidesGenerationProgressNotifier(new SlidesGenerationProgressNotifier() {
      @Override
      void sendUploadFailedMessage(PresentationUploadToken token, String errorDetail) {
        failedUploads << token.presentationId
      }
    })
    filter = new PresentationUploadFilter(meetingService: meetingService)

    // Upload tokens arrive from akka-apps; this registers one the way that message does.
    def presUploadToken = new PresentationUploadToken('DEFAULT_PRESENTATION_POD', TOKEN, 'slides.pdf', 'meeting-1', 'pres-1', 'w_uploader')
    meetingService.uploadAuthzTokens[TOKEN] = presUploadToken
    receivedAt = presUploadToken.receivedAt
  }

  // Sends a request through the filter. `rest` is everything behind the filter, the upload action
  // included, and runs while the request is still in flight.
  private void send(String method, String uri, Closure rest = {}) {
    filter.doFilter(new MockHttpServletRequest(method, uri), new MockHttpServletResponse(), { req, res -> rest() } as FilterChain)
  }

  // Runs the purge as it would run this long after the token was received.
  private void purgeAfter(long seconds) {
    meetingService.purgePresentationUploadTokens(receivedAt + seconds * 1000)
  }

  // What the upload action does first with every request it handles.
  private PresentationUploadToken uploadActionTakesToken() {
    meetingService.consumePresentationUploadToken(TOKEN)
  }

  def "The token of an upload request that has reached bbb-web is kept however long its file takes"() {
    given:
    PresentationUploadToken takenByAction = null

    when:
    send('POST', UPLOAD_URI) {
      purgeAfter(60 * 60)
      takenByAction = uploadActionTakesToken()
    }

    then:
    takenByAction?.presentationId == 'pres-1'
    failedUploads.isEmpty()
  }

  def "An upload the action has handled is not reported"() {
    when:
    send('POST', UPLOAD_URI) { uploadActionTakesToken() }

    then:
    failedUploads.isEmpty()
    !meetingService.authzTokenIsValid(TOKEN)
  }

  // The timeout no longer ends an upload once its request has arrived, so the filter has to.
  def "An upload request that ends before the action took its token is reported as failed"() {
    when:
    send('POST', UPLOAD_URI)

    then:
    failedUploads == ['pres-1']
    !meetingService.authzTokenIsValid(TOKEN)

    when: 'nothing is left for the purge to report'
    purgeAfter(60 * 60)

    then:
    failedUploads == ['pres-1']
  }

  def "An upload request that ends with an exception is reported as failed"() {
    when:
    send('POST', UPLOAD_URI) { throw new IOException('the connection was closed') }

    then:
    thrown(IOException)
    failedUploads == ['pres-1']
    !meetingService.authzTokenIsValid(TOKEN)
  }

  // The upload action answers POST only: nothing would take the token of another request.
  def "A request with another method leaves the token to the timeout"() {
    when:
    send(method, UPLOAD_URI)

    then:
    failedUploads.isEmpty()
    meetingService.authzTokenIsValid(TOKEN)

    when:
    purgeAfter(START_TIMEOUT)

    then:
    failedUploads == ['pres-1']

    where:
    method << ['GET', 'PUT', 'OPTIONS', 'HEAD']
  }

  def "A request on another path leaves the token to the timeout"() {
    when:
    send('POST', uri)

    then:
    failedUploads.isEmpty()
    meetingService.authzTokenIsValid(TOKEN)

    when:
    purgeAfter(START_TIMEOUT)

    then:
    failedUploads == ['pres-1']

    where:
    uri << [
      '/bigbluebutton/presentation/checkPresentation',
      "/bigbluebutton/presentation/${TOKEN}/upload/",
      "/bigbluebutton/presentation/${TOKEN}/./upload",
      "/presentation/${TOKEN}/upload",
    ]
  }

  def "A second request with the token of an upload on its way does not end that upload"() {
    given:
    PresentationUploadToken takenByAction = null

    when:
    send('POST', UPLOAD_URI) {
      send('POST', UPLOAD_URI)
      takenByAction = uploadActionTakesToken()
    }

    then:
    takenByAction?.presentationId == 'pres-1'
    failedUploads.isEmpty()
  }

  def "A request with a token that is gone is passed on and reports nothing"() {
    given:
    uploadActionTakesToken()
    boolean passedOn = false

    when:
    send('POST', UPLOAD_URI) { passedOn = true }

    then:
    passedOn
    failedUploads.isEmpty()
  }

  // A filter ahead of this one that reads the request body would hold the request back until
  // the file is in, and the token would not be kept through that wait.
  def "The filter runs ahead of every other filter"() {
    expect:
    filter.order == Ordered.HIGHEST_PRECEDENCE
  }
}
