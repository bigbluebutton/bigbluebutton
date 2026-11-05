package org.bigbluebutton.web.controllers

import grails.testing.web.controllers.ControllerUnitTest
import groovy.json.JsonSlurper
import jakarta.servlet.RequestDispatcher
import spock.lang.Specification

/**
 * Coverage for `ErrorController#serverError`, the target of the "500" URL mapping: the same JSON
 * body Spring Boot's error page sent, for the path that failed.
 */
class ErrorControllerSpec extends Specification implements ControllerUnitTest<ErrorController> {

  def "An exception forwarded by the exception resolver answers a JSON 500 for the original path"() {
    given: "the request as GrailsExceptionResolver forwards it to the 500 mapping"
    long before = System.currentTimeMillis()
    request.setAttribute(RequestDispatcher.ERROR_STATUS_CODE, 500)
    request.setAttribute(RequestDispatcher.FORWARD_REQUEST_URI, '/bigbluebutton/presentation/checkPresentation')
    request.requestURI = '/grails/error/serverError.dispatch'

    when:
    controller.serverError()

    then:
    response.status == 500
    response.contentType.startsWith('application/json')
    response.text ==~ /\{"timestamp":\d+,"status":500,"error":"Internal Server Error","path":"\/bigbluebutton\/presentation\/checkPresentation"\}/
    new JsonSlurper().parseText(response.text).timestamp >= before
  }

  def "An error dispatch from the container reports the path that failed"() {
    given:
    request.setAttribute(RequestDispatcher.ERROR_STATUS_CODE, 500)
    request.setAttribute(RequestDispatcher.ERROR_REQUEST_URI, '/bigbluebutton/api/create')
    request.requestURI = '/error'

    when:
    controller.serverError()

    then:
    response.status == 500
    new JsonSlurper().parseText(response.text).path == '/bigbluebutton/api/create'
  }

  def "A request for the error handler itself answers 404"() {
    given:
    request.requestURI = '/bigbluebutton/error/serverError'

    when:
    controller.serverError()

    then:
    response.status == 404
    response.text == ''
  }
}
