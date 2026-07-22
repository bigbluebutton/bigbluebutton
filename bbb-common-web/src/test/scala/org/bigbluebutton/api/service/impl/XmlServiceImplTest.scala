package org.bigbluebutton.api.service.impl

import java.util.Collections

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.springframework.data.domain.{ PageImpl, PageRequest }

class XmlServiceImplTest extends AnyFlatSpec with Matchers {

  private val service = new XmlServiceImpl()

  private def page(totalElements: Long): PageImpl[String] = {
    new PageImpl[String](Collections.singletonList("recording"), PageRequest.ofSize(1), totalElements)
  }

  it should "return a valid no recordings response" in {
    val result = service.noRecordings()

    result should include("<returncode>SUCCESS</returncode>")
    result should include("<messageKey>noRecordings</messageKey>")
  }

  it should "append total elements to a valid paginated response" in {
    val recordingName = "\u0442\u0435\u0441\u0442"
    val response =
      s"<response><returncode>SUCCESS</returncode><recordings><recording><name>$recordingName</name></recording></recordings></response>"

    val result = service.constructPaginatedResponse(page(7), 0, response)

    result should include("<returncode>SUCCESS</returncode>")
    result should include("<name>" + recordingName + "</name>")
    result should include("<totalElements>7</totalElements>")
  }

  it should "return a failure response when pagination input XML is blank" in {
    val result = service.constructPaginatedResponse(page(1), 0, " ")

    result should include("<returncode>FAILED</returncode>")
    result should include("<messageKey>unexpectedError</messageKey>")
  }

  it should "return a failure response when pagination input XML cannot be parsed" in {
    val malformedResponse = "<response><returncode>SUCCESS</returncode>"

    val result = service.constructPaginatedResponse(page(1), 0, malformedResponse)

    result should include("<returncode>FAILED</returncode>")
    result should include("<messageKey>unexpectedError</messageKey>")
    result should not equal malformedResponse
  }
}
