package org.bigbluebutton.core.models

/**
 * Per-user sliding-window rate limiter for presentation upload-token requests.
 *
 * Each meeting owns one instance (held by LiveMeeting) and it is only ever
 * touched from that meeting's single MeetingActor thread, so no locking is
 * needed (same assumption as Users2x and the other mutable models).
 *
 * Stale per-user timestamps are pruned lazily on access; the whole instance is
 * garbage-collected when the meeting ends, so no scheduled cleanup is required.
 */
class PresentationUploadTokenRateLimiter {

  // userId -> ascending timestamps (ms) of recent allowed token requests
  private var requestTimestamps: Map[String, Vector[Long]] = Map.empty

  /**
   * Prunes this user's timestamps older than (nowMs - windowMs), then admits the
   * request (recording nowMs) when the remaining count is below maxRequests.
   *
   * A maxRequests of 0 or less disables the limit and always admits.
   *
   * Returns true when the request is allowed, false when it is throttled.
   */
  def allow(userId: String, nowMs: Long, maxRequests: Int, windowMs: Long): Boolean = {
    if (maxRequests <= 0) {
      // Limit disabled; nothing to record.
      true
    } else {
      val cutoff = nowMs - windowMs
      val recent = requestTimestamps.getOrElse(userId, Vector.empty).filter(_ > cutoff)

      if (recent.size < maxRequests) {
        requestTimestamps = requestTimestamps.updated(userId, recent :+ nowMs)
        true
      } else {
        // recent is non-empty here. Keep it pruned so stale entries are not retained.
        requestTimestamps = requestTimestamps.updated(userId, recent)
        false
      }
    }
  }

  def removeUser(userId: String): Unit = {
    requestTimestamps = requestTimestamps - userId
  }
}
