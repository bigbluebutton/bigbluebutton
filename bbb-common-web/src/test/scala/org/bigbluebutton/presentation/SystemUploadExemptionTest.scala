package org.bigbluebutton.presentation

import java.util.ArrayList

import org.bigbluebutton.api.messaging.messages.PresentationUploadToken
import org.bigbluebutton.api.util.UnitSpec

/**
 * The server-origin flag decides whether an upload is metered against the per-meeting
 * conversion budget. It must be derived only from the token bbb-apps-akka issued, and it
 * must fail towards "metered" whenever the origin is not provably the server.
 */
class SystemUploadExemptionTest extends UnitSpec {

  private def token(userId: String): PresentationUploadToken =
    new PresentationUploadToken("DEFAULT_PRESENTATION_POD", "authz", "f.pdf", "m1", "p1", userId)

  it should "classify a token issued to the server as a system upload" in {
    assert(token("system").isSystemUpload)
  }

  it should "classify a token issued to a participant as a normal upload" in {
    assert(!token("w_abcdefghijkl").isSystemUpload)
    assert(!token("v_abcdefghijkl").isSystemUpload)
  }

  // Fails if written userId.equals(SYSTEM_USER_ID): a header without a userId must fall back
  // to the metered path rather than throw inside the message-handling actor.
  it should "treat a missing userId as a normal upload rather than throwing" in {
    assert(!token(null).isSystemUpload)
  }

  // Fails on any case-insensitive, trimming or prefix-matching implementation.
  it should "match the system sentinel exactly" in {
    assert(!token("System").isSystemUpload)
    assert(!token("SYSTEM").isSystemUpload)
    assert(!token(" system").isSystemUpload)
    assert(!token("system ").isSystemUpload)
    assert(!token("systematic").isSystemUpload)
    assert(!token("").isSystemUpload)
  }

  private def uploadFailReasons = new ArrayList[String]()

  // Every constructor predating the flag must land on the metered path. This is the
  // fail-open direction: create pre-upload, insertDocument and the deck copied into a new
  // breakout room all use these forms and none of them are server captures.
  it should "default every UploadedPresentation constructor to a normal upload" in {
    assert(!new UploadedPresentation("pod", "m1", "p1", "tmp", "f.pdf", "http://base",
      false, "authz", false, uploadFailReasons, false).isSystemUpload)
    assert(!new UploadedPresentation("pod", "m1", "p1", "tmp", "f.pdf", "http://base",
      false, "authz", false, uploadFailReasons).isSystemUpload)
    assert(!new UploadedPresentation("pod", "m1", "p1", "f.pdf", "http://base",
      false, "authz", false, uploadFailReasons).isSystemUpload)
    assert(!new UploadedPresentation("pod", "m1", "p1", "f.pdf", "http://base",
      false, "authz", false, uploadFailReasons, true).isSystemUpload)
  }

  it should "carry the flag once set from the upload token" in {
    val pres = new UploadedPresentation("pod", "m1", "p1", "tmp", "f.pdf", "http://base",
      false, "authz", false, uploadFailReasons, false)

    pres.setSystemUpload(token("system").isSystemUpload)
    assert(pres.isSystemUpload)

    pres.setSystemUpload(token("w_abcdefghijkl").isSystemUpload)
    assert(!pres.isSystemUpload)
  }
}
