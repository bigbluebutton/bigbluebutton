package org.bigbluebutton.service

import org.apache.pekko.stream.Materializer
import org.bigbluebutton.protos.{ MeetingService, TestRequest, TestResponse }

import scala.concurrent.Future

class MeetingServiceImpl(implicit materializer: Materializer) extends MeetingService {

  import materializer.executionContext

  override def test(in: TestRequest): Future[TestResponse] = {
    println(s"Received test request with message ${in.msg}")
    Future.successful(TestResponse(s"Request successful"))
  }
}
