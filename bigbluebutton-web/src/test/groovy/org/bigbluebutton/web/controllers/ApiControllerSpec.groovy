package org.bigbluebutton.web.controllers

import grails.testing.web.controllers.ControllerUnitTest
import org.bigbluebutton.api.ParamsProcessorUtil
import spock.lang.Specification

class ApiControllerSpec extends Specification implements ControllerUnitTest<ApiController> {

  def apiVersion = "2.0"

  def setup() {
    // Find a better way by auto-wiring
    def paramsProcessorUtil = new ParamsProcessorUtil()
    paramsProcessorUtil.setApiVersion(apiVersion)
    controller.paramsProcessorUtil = paramsProcessorUtil
  }

  def cleanup() {
  }

  def "Test API version"() {
    when: "The API version is executed"
    controller.index()

    then: "API version is returned"
    def expected = new XmlSlurper().parseText("<response><returncode>SUCCESS</returncode><version>" + apiVersion + "</version></response>")
    def result = new XmlSlurper().parseText(response.text)
    result.toString() == expected.toString()
  }
}
