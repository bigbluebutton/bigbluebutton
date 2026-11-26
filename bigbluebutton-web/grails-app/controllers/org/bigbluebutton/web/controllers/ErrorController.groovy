package org.bigbluebutton.web.controllers

import groovy.json.JsonOutput
import jakarta.servlet.RequestDispatcher

/**
 * Target of the "500" URL mapping. GrailsExceptionResolver has already logged the exception;
 * this only answers with the same body Spring Boot's error page used to send.
 */
class ErrorController {

  def serverError() {
    // Reached through the generic $controller/$action mapping rather than from an error.
    if (request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE) == null) {
      response.sendError(404)
      return
    }
    String path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI) ?: request.forwardURI
    render(status: 500, contentType: 'application/json', text: JsonOutput.toJson([
        timestamp: System.currentTimeMillis(),
        status   : 500,
        error    : 'Internal Server Error',
        path     : path,
    ]))
  }
}
