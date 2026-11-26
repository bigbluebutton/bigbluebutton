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

  @spock.lang.Unroll
  def "The removed page count path #path is not mapped"() {
    expect:
    urlMappingsHolder.matchAll(path).length == 0

    where:
    path << ['slides', 'thumbnails', 'svgs', 'textfiles'].collect { "/bigbluebutton/presentation/m1/m1/pres-1/${it}" }
  }

  @spock.lang.Unroll
  def "A page asset path is mapped only for a page id: #path"() {
    expect:
    (urlMappingsHolder.matchAll(path).length > 0) == mapped

    where:
    path                                                                              || mapped
    '/bigbluebutton/presentation/m1/m1/pres-1/svg/3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e' || true
    '/bigbluebutton/presentation/m1/m1/pres-1/svg/2'                                    || false
  }
}
