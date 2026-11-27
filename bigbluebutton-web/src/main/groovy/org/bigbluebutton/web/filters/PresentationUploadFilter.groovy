package org.bigbluebutton.web.filters

import groovy.transform.CompileStatic
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.messaging.messages.PresentationUploadToken
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.Ordered
import org.springframework.web.filter.OncePerRequestFilter

import java.util.regex.Matcher
import java.util.regex.Pattern

/**
 * Follows a presentation upload request from the moment it reaches bbb-web until it ends.
 *
 * The upload action runs only once the whole file has arrived, so until then this filter is the
 * only code that knows the request exists. On arrival it marks the upload token as started, which
 * keeps the token past presentationUploadStartTimeout for as long as the file takes. A request
 * that never gets here leaves the token unmarked, however far it got in nginx, and the timeout
 * ends that upload.
 *
 * A started token is no longer dropped by the timeout, so when the request ends and the upload
 * action has not taken the token, the upload is reported as failed here: nothing else would end it.
 */
@CompileStatic
class PresentationUploadFilter extends OncePerRequestFilter implements Ordered {
  private static final Logger log = LoggerFactory.getLogger(PresentationUploadFilter)

  // The upload action refuses a request that did not arrive on this path, so both use this pattern.
  public static final Pattern UPLOAD_URI_PATTERN = Pattern.compile(
    '/bigbluebutton/presentation/([A-Za-z0-9_-]+)/upload'
  )

  MeetingService meetingService

  // Ahead of every other filter: one that reads the request body would hold the request back
  // until the file is in, which is the wait the token has to be kept through.
  @Override
  int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE
  }

  // The upload action answers POST only.
  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return request.method != 'POST'
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    String authzToken = uploadTokenOf(request)
    // False for a second request with the same token: the first one answers for the upload.
    boolean startedUpload = authzToken != null && meetingService.markPresentationUploadStarted(authzToken)
    try {
      chain.doFilter(request, response)
    } finally {
      if (startedUpload) {
        failUploadLeftUnhandled(authzToken)
      }
    }
  }

  private static String uploadTokenOf(HttpServletRequest request) {
    String requestUri = request.requestURI
    if (requestUri == null) return null
    Matcher uriMatcher = UPLOAD_URI_PATTERN.matcher(requestUri)
    return uriMatcher.matches() ? uriMatcher.group(1) : null
  }

  // The upload action takes the token of every request it handles, whatever the outcome.
  private void failUploadLeftUnhandled(String authzToken) {
    try {
      PresentationUploadToken presUploadToken = meetingService.consumePresentationUploadToken(authzToken)
      if (presUploadToken == null) return
      log.warn("Presentation upload request ended before the upload was handled. meetingId={} presentationId={}",
          presUploadToken.meetingId, presUploadToken.presentationId)
      meetingService.sendPresentationUploadFailedMessage(presUploadToken, "Upload request ended before it was handled")
    } catch (Exception e) {
      // Not rethrown: it would replace the outcome of the request itself.
      log.error("Could not report a presentation upload that ended before it was handled", e)
    }
  }
}
