package org.bigbluebutton.web

import grails.testing.web.UrlMappingsUnitTest
import org.bigbluebutton.web.controllers.ErrorController
import spock.lang.Specification

class UrlMappingsSpec extends Specification implements UrlMappingsUnitTest<UrlMappings> {

  Class[] getControllersToMock() {
    [ErrorController] as Class[]
  }

  def "An unhandled exception is handed to ErrorController, not to a view"() {
    expect:
    verifyForwardUrlMapping(500, controller: 'error', action: 'serverError')
  }
}
