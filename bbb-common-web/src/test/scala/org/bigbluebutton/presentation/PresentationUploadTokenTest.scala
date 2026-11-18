package org.bigbluebutton.presentation

import org.bigbluebutton.api.messaging.messages.PresentationUploadToken
import org.bigbluebutton.api.util.UnitSpec

/**
 * A token is abandoned once the client it was issued to has had its time to start sending and
 * no upload request arrived. Getting this wrong in one direction fails uploads that are still
 * arriving; in the other it leaves presentations showing as uploading until the meeting ends.
 */
class PresentationUploadTokenTest extends UnitSpec {

  private val timeout = 60000L

  private def token(userId: String = "w_abcdefghijkl"): PresentationUploadToken =
    new PresentationUploadToken("DEFAULT_PRESENTATION_POD", "authz", "f.pdf", "m1", "p1", userId)

  it should "not be abandoned while the client still has time to start sending" in {
    val t = token()
    val now = System.currentTimeMillis()
    assert(!t.isAbandoned(now, timeout))
    assert(!t.isAbandoned(now + timeout / 2, timeout))
  }

  it should "be abandoned once no upload request arrived in time" in {
    val t = token()
    assert(t.isAbandoned(System.currentTimeMillis() + timeout, timeout))
    assert(t.isAbandoned(System.currentTimeMillis() + 10 * timeout, timeout))
  }

  // The request is handled only when its body is complete: a large file on a slow connection
  // keeps the token unconsumed long after its time to start has passed.
  it should "never be abandoned once its upload request has arrived" in {
    val t = token()
    t.markUploadStarted()
    assert(!t.isAbandoned(System.currentTimeMillis() + 1000 * timeout, timeout))
  }

  // bbb-apps-akka issues these before the file is rendered, which can take minutes.
  it should "never be abandoned when issued for a system upload" in {
    val t = token(PresentationUploadToken.SYSTEM_USER_ID)
    assert(!t.isAbandoned(System.currentTimeMillis() + 1000 * timeout, timeout))
  }

  it should "treat a missing userId as a participant's token" in {
    assert(token(null).isAbandoned(System.currentTimeMillis() + timeout, timeout))
  }
}
