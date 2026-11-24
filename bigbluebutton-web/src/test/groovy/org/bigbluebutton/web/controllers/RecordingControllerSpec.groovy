package org.bigbluebutton.web.controllers

import grails.testing.web.controllers.ControllerUnitTest
import groovy.xml.XmlSlurper
import org.apache.commons.codec.digest.DigestUtils
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.ParamsProcessorUtil
import org.bigbluebutton.api.domain.RecordingProcessingInfo
import org.bigbluebutton.api.util.ResponseBuilder
import spock.lang.Specification

/**
 * Coverage for `RecordingController#getRecordingProcessingInfoHandler`: the
 * checksum gate, the answer for an empty and a busy pipeline, and an
 * unreadable pipeline answering FAILED rather than processing=false.
 */
class RecordingControllerSpec extends Specification implements ControllerUnitTest<RecordingController> {

  static final String SALT = "b4578c133b8a49acaecacbb3abec91a1"
  static final String API_CALL = "getRecordingProcessingInfo"

  // What the stubbed MeetingService reports, or null to throw as an unreachable Redis does.
  RecordingProcessingInfo pipeline = new RecordingProcessingInfo(0, 0, 0, null, null)

  def setup() {
    ParamsProcessorUtil paramsProcessorUtil = new ParamsProcessorUtil()
    paramsProcessorUtil.setSecuritySalt(SALT)
    paramsProcessorUtil.setSupportedChecksumAlgorithms("sha1,sha256,sha384,sha512")
    controller.paramsProcessorUtil = paramsProcessorUtil

    def spec = this
    controller.meetingService = new MeetingService() {
      @Override
      RecordingProcessingInfo getRecordingProcessingInfo() {
        if (spec.pipeline == null) {
          throw new RuntimeException("connection refused")
        }
        return spec.pipeline
      }
    }

    // The templates the application ships.
    controller.responseBuilder = new ResponseBuilder(new File("src/main/webapp/WEB-INF/freemarker"))
  }

  private def call(String checksum) {
    if (checksum != null) {
      request.setQueryString("checksum=" + checksum)
      params.checksum = checksum
    }
    request.format = "xml"
    controller.getRecordingProcessingInfoHandler()
    return new XmlSlurper().parseText(response.text)
  }

  private static String sign(String call = API_CALL) {
    DigestUtils.sha256Hex(call + SALT)
  }

  def "A missing checksum is rejected"() {
    when:
    def xml = call(null)

    then:
    xml.returncode == "FAILED"
    xml.messageKey == "checksumError"
  }

  def "A wrong checksum, or another call's, is rejected"() {
    when:
    def xml = call(checksum)

    then:
    xml.returncode == "FAILED"
    xml.messageKey == "checksumError"

    where:
    checksum << ["0" * 64, sign("getRecordings")]
  }

  def "An empty pipeline answers processing=false, zero counts and no oldest times"() {
    when:
    def xml = call(sign())

    then:
    xml.returncode == "SUCCESS"
    xml.processing == "false"
    xml.queuedCount == "0"
    xml.runningCount == "0"
    xml.failedCount == "0"
    xml.oldestQueuedTime.size() == 0
    xml.oldestRunningTime.size() == 0
    response.contentType.startsWith("text/xml")
    response.getHeader("Cache-Control") == "no-cache"
  }

  def "A busy pipeline answers its counts, when the oldest queued work was queued and when the oldest running step started"() {
    given:
    pipeline = new RecordingProcessingInfo(2, 1, 3, 1700000000000L, 1700000100000L)

    when:
    def xml = call(sign())

    then:
    xml.returncode == "SUCCESS"
    xml.processing == "true"
    xml.queuedCount == "2"
    xml.runningCount == "1"
    xml.failedCount == "3"
    xml.oldestQueuedTime == "1700000000000"
    xml.oldestRunningTime == "1700000100000"
  }

  def "Failed recordings alone don't keep processing true"() {
    given:
    pipeline = new RecordingProcessingInfo(0, 0, 1, null, null)

    when:
    def xml = call(sign())

    then:
    xml.processing == "false"
    xml.failedCount == "1"
  }

  def "A pipeline that can't be read answers FAILED, never processing=false"() {
    given:
    pipeline = null

    when:
    def xml = call(sign())

    then:
    xml.returncode == "FAILED"
    xml.messageKey == "recordingStatusUnavailable"
    xml.processing.size() == 0
  }
}
