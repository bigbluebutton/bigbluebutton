package org.bigbluebutton.core.models

import org.scalatest.flatspec.AnyFlatSpec

// Extends AnyFlatSpec directly; see PresentationPodsAppSpec for why the shared UnitSpec is not used.
class PresentationUploadTokenRateLimiterSpec extends AnyFlatSpec {

  private val windowMs = 60000L

  behavior of "PresentationUploadTokenRateLimiter.allow"

  it should "admit up to maxRequests within the window and refuse the next" in {
    val limiter = new PresentationUploadTokenRateLimiter
    assert(limiter.allow("u1", 0L, 2, windowMs))
    assert(limiter.allow("u1", 1L, 2, windowMs))
    assert(!limiter.allow("u1", 2L, 2, windowMs))
  }

  it should "admit again once earlier requests leave the window" in {
    val limiter = new PresentationUploadTokenRateLimiter
    assert(limiter.allow("u1", 0L, 1, windowMs))
    assert(!limiter.allow("u1", windowMs - 1, 1, windowMs))
    assert(limiter.allow("u1", windowMs, 1, windowMs))
  }

  it should "always admit when the limit is disabled" in {
    val limiter = new PresentationUploadTokenRateLimiter
    (0 until 100).foreach(i => assert(limiter.allow("u1", i.toLong, 0, windowMs)))
  }

  behavior of "PresentationUploadTokenRateLimiter.shouldReportRejection"

  it should "report the first rejection and suppress the rest within the window" in {
    val limiter = new PresentationUploadTokenRateLimiter
    assert(limiter.shouldReportRejection("u1", 0L, windowMs))
    assert(!limiter.shouldReportRejection("u1", 1L, windowMs))
    assert(!limiter.shouldReportRejection("u1", windowMs - 1, windowMs))
  }

  it should "report again once the window has passed" in {
    val limiter = new PresentationUploadTokenRateLimiter
    assert(limiter.shouldReportRejection("u1", 0L, windowMs))
    assert(limiter.shouldReportRejection("u1", windowMs, windowMs))
    assert(!limiter.shouldReportRejection("u1", windowMs + 1, windowMs))
  }

  it should "track users independently" in {
    val limiter = new PresentationUploadTokenRateLimiter
    assert(limiter.shouldReportRejection("u1", 0L, windowMs))
    assert(limiter.shouldReportRejection("u2", 0L, windowMs))
  }

  behavior of "PresentationUploadTokenRateLimiter.recordRejectionRow"

  it should "keep rows up to maxRows and return the oldest beyond it" in {
    val limiter = new PresentationUploadTokenRateLimiter
    assert(limiter.recordRejectionRow("u1", "p1", 2) == Vector.empty)
    assert(limiter.recordRejectionRow("u1", "p2", 2) == Vector.empty)
    assert(limiter.recordRejectionRow("u1", "p3", 2) == Vector("p1"))
    assert(limiter.recordRejectionRow("u1", "p4", 2) == Vector("p2"))
  }

  it should "track rows per user" in {
    val limiter = new PresentationUploadTokenRateLimiter
    assert(limiter.recordRejectionRow("u1", "p1", 1) == Vector.empty)
    assert(limiter.recordRejectionRow("u2", "p2", 1) == Vector.empty)
    assert(limiter.recordRejectionRow("u1", "p3", 1) == Vector("p1"))
  }

  behavior of "PresentationUploadTokenRateLimiter.maxRejectionRows"

  it should "keep one window of refusals plus its rate-limit row" in {
    assert(PresentationUploadTokenRateLimiter.maxRejectionRows(5) == 6)
  }

  it should "fall back to the default limit when the limit is disabled" in {
    assert(PresentationUploadTokenRateLimiter.maxRejectionRows(0) == 21)
  }
}
