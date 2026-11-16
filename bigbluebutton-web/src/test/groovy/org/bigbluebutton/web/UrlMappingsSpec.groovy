package org.bigbluebutton.web

import grails.testing.web.UrlMappingsUnitTest
import org.bigbluebutton.web.controllers.ErrorController
import org.bigbluebutton.web.controllers.RecordingController
import spock.lang.Specification

class UrlMappingsSpec extends Specification implements UrlMappingsUnitTest<UrlMappings> {

  Class[] getControllersToMock() {
    [ErrorController, RecordingController] as Class[]
  }

  def "An unhandled exception is handed to ErrorController, not to a view"() {
    expect:
    verifyForwardUrlMapping(500, controller: 'error', action: 'serverError')
  }

  def "getRecordingProcessingInfo is answered by RecordingController for #method"() {
    given:
    request.method = method

    expect:
    verifyForwardUrlMapping("/bigbluebutton/api/getRecordingProcessingInfo",
        controller: 'recording', action: 'getRecordingProcessingInfoHandler')

    where:
    method << ['GET', 'POST']
  }
}
