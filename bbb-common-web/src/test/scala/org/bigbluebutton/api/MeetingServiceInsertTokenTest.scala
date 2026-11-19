package org.bigbluebutton.api

import org.bigbluebutton.api.messaging.messages.PresentationUploadToken
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

// A POST that arrives after its upload was refused must not convert (Ac-B 42): removing the pending token of
// one presentation leaves the tokens of the others.
class MeetingServiceInsertTokenTest extends AnyFlatSpec with Matchers {

  private val meetingId = "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1700000000000"
  private val firstId = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678-1700000000001"
  private val secondId = "b1b2c3d4e5f60718293a4b5c6d7e8f9012345678-1700000000002"

  "removePendingUploadToken" should "remove the token of that presentation only" in {
    val service = new MeetingService()
    val first = new PresentationUploadToken("pod", "authz-first", "a.pdf", meetingId, firstId, "w_user")
    val second = new PresentationUploadToken("pod", "authz-second", "b.pdf", meetingId, secondId, "w_user")
    service.processPresentationUploadToken(first)
    service.processPresentationUploadToken(second)

    service.removePendingUploadToken(firstId)

    service.consumePresentationUploadToken("authz-first") shouldBe null
    service.consumePresentationUploadToken("authz-second") shouldBe theSameInstanceAs(second)
    service.consumePresentationUploadToken("authz-second") shouldBe null
  }
}
