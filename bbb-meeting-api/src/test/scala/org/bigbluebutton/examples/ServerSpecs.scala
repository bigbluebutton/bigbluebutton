package org.bigbluebutton.examples

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.testkit.{RouteTestTimeout, ScalatestRouteTest}
import org.bigbluebutton.Server
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec

class ServerSpecs extends AnyWordSpec
  with Matchers
  with ScalatestRouteTest {

  "A basic GET request to create a meeting" should {
    "return OK [200]" in {
      Get("/api/create?allowStartStopRecording=true&attendeePW=ap&autoStartRecording=false&meetingID=random-1&moderatorPW=mp&name=random-255929s8&record=false&voiceBridge=72716&welcome=welcome&checksum=c64fbd15cf697022e8a772b1f4a8dda62ce1f762") ~> Server.route ~> check {
        status shouldBe StatusCodes.OK
      }
    }
  }
}
