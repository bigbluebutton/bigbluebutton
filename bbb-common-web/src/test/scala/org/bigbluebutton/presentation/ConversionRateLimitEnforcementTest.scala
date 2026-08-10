package org.bigbluebutton.presentation

import java.util.ArrayList

import org.bigbluebutton.api.util.{ RequestRateLimiter, UnitSpec }
import org.bigbluebutton.api2.meeting.OldMeetingMsgHdlrActor
import org.bigbluebutton.common2.msgs.{ BbbClientMsgHeader, PresentationUploadTokenSysPubMsg, PresentationUploadTokenSysPubMsgBody }
import org.bigbluebutton.presentation.imp.SlidesGenerationProgressNotifier
import org.bigbluebutton.presentation.messages.IDocConversionMsg

/**
 * The per-meeting conversion limit is the only admission control in front of the conversion
 * pipeline, and one predicate decides whether it applies. These cases exist to fail if that
 * predicate is inverted, removed, or fed the wrong origin - none of which any other committed
 * test in this module observes.
 */
class ConversionRateLimitEnforcementTest extends UnitSpec {

  // Records instead of sending. sendConversionRateLimited is the only observable effect of the
  // reject branch; sendDocConversionProgress must be inert so the accept path stays offline.
  private class RecordingNotifier extends SlidesGenerationProgressNotifier {
    var rateLimitedCount = 0

    override def sendConversionRateLimited(pres: UploadedPresentation): Unit =
      rateLimitedCount += 1

    override def sendDocConversionProgress(msg: IDocConversionMsg): Unit = ()
  }

  // processDocumentStart is where real work begins (Tika, executors, the filesystem). Overriding
  // it turns "did we proceed past the limiter" into an observable flag without doing any of it.
  private class ProbeService(notifier: RecordingNotifier) extends DocumentConversionServiceImp {
    var startedCount = 0

    setSlidesGenerationProgressNotifier(notifier)

    override def processDocumentStart(pres: UploadedPresentation): Unit =
      startedCount += 1
  }

  private def limiter(maxRequests: Int, windowSec: Int): RequestRateLimiter = {
    val l = new RequestRateLimiter
    l.setMaxRequests(maxRequests)
    l.setWindowSec(windowSec)
    // Deliberately no start(): the sweep thread is not needed and allow() prunes lazily.
    l
  }

  private def presentation(meetingId: String, system: Boolean): UploadedPresentation = {
    val pres = new UploadedPresentation("DEFAULT_PRESENTATION_POD", meetingId, "p-" + meetingId,
      "tmp", "f.pdf", "http://base", false, "authz", false, new ArrayList[String](), false)
    pres.setSystemUpload(system)
    // startConversion() short-circuits the private sendDocConversionRequestReceived, keeping the
    // accept path free of collaborators we have not wired.
    pres.startConversion()
    pres
  }

  private def serviceWith(l: RequestRateLimiter): (ProbeService, RecordingNotifier) = {
    val notifier = new RecordingNotifier
    val svc = new ProbeService(notifier)
    svc.setConversionRateLimiter(l)
    (svc, notifier)
  }

  // Fails if the guard is inverted to pres.isSystemUpload(): participant uploads would then never
  // be metered, which is the fail-open direction.
  it should "reject a participant upload once the meeting's budget is spent" in {
    val (svc, notifier) = serviceWith(limiter(1, 60))

    svc.processDocument(presentation("m1", system = false), false)
    svc.processDocument(presentation("m1", system = false), false)

    assert(svc.startedCount == 1)
    assert(notifier.rateLimitedCount == 1)
  }

  // Fails if the guard is inverted, and if the exemption is dropped altogether.
  it should "admit a server capture with the meeting's budget fully spent" in {
    val l = limiter(1, 60)
    val (svc, notifier) = serviceWith(l)

    svc.processDocument(presentation("m1", system = false), false)
    assert(!l.allow("m1", System.currentTimeMillis()))

    svc.processDocument(presentation("m1", system = true), false)
    svc.processDocument(presentation("m1", system = true), false)

    assert(svc.startedCount == 3)
    assert(notifier.rateLimitedCount == 0)
  }

  // A capture must not spend the budget it skips, or it would throttle participants indirectly.
  it should "not consume the meeting's budget for a server capture" in {
    val l = limiter(1, 60)
    val (svc, _) = serviceWith(l)

    svc.processDocument(presentation("m1", system = true), false)

    assert(l.allow("m1", System.currentTimeMillis()))
  }

  it should "key the budget per meeting" in {
    val (svc, notifier) = serviceWith(limiter(1, 60))

    svc.processDocument(presentation("m1", system = false), false)
    svc.processDocument(presentation("m2", system = false), false)

    assert(svc.startedCount == 2)
    assert(notifier.rateLimitedCount == 0)
  }

  // Documents the fail-open default explicitly: an unwired bean means no limit. If this is ever
  // made fail-closed, this case should be the one that says so.
  it should "admit everything when no limiter is wired" in {
    val notifier = new RecordingNotifier
    val svc = new ProbeService(notifier)

    svc.processDocument(presentation("m1", system = false), false)
    svc.processDocument(presentation("m1", system = false), false)

    assert(svc.startedCount == 2)
    assert(notifier.rateLimitedCount == 0)
  }

  // The predicate in isolation, including the null-limiter and null-userId directions.
  it should "expose the decision directly" in {
    val l = limiter(1, 60)
    val svc = new DocumentConversionServiceImp
    svc.setConversionRateLimiter(l)
    val now = 1000L

    assert(!svc.isRateLimited(presentation("m1", system = false), now))
    assert(svc.isRateLimited(presentation("m1", system = false), now + 1))
    assert(!svc.isRateLimited(presentation("m1", system = true), now + 2))
  }

  // Fails if the actor is changed to stamp a literal, or to read the userId from the body: either
  // would make every upload in the system look like a server capture.
  it should "take the token's userId from the message header, not the body" in {
    val header = BbbClientMsgHeader("PresentationUploadTokenSysPubMsg", "m1", "w_abcdefghijkl")
    val body = PresentationUploadTokenSysPubMsgBody("DEFAULT_PRESENTATION_POD", "authz", "f.pdf", "m1", "p1")

    val token = OldMeetingMsgHdlrActor.toPresentationUploadToken(PresentationUploadTokenSysPubMsg(header, body))

    assert(token.userId == "w_abcdefghijkl")
    assert(!token.isSystemUpload)
    assert(token.podId == "DEFAULT_PRESENTATION_POD")
    assert(token.meetingId == "m1")
    assert(token.presentationId == "p1")
  }

  it should "classify a header userId of system as a system upload" in {
    val header = BbbClientMsgHeader("PresentationUploadTokenSysPubMsg", "m1", "system")
    val body = PresentationUploadTokenSysPubMsgBody("DEFAULT_PRESENTATION_POD", "authz", "f.pdf", "m1", "p1")

    assert(OldMeetingMsgHdlrActor.toPresentationUploadToken(PresentationUploadTokenSysPubMsg(header, body)).isSystemUpload)
  }
}
