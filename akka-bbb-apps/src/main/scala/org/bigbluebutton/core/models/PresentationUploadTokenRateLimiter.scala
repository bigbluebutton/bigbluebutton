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
 * A user's entries are kept after they leave: they are small, and forgetting them
 * would also forget the rejection rows still to be deleted.
 */
class PresentationUploadTokenRateLimiter {

  // userId -> ascending timestamps (ms) of recent allowed token requests
  private var requestTimestamps: Map[String, Vector[Long]] = Map.empty

  // userId -> ids of the rejection rows written for that user, oldest first
  private var rejectionRows: Map[String, Vector[String]] = Map.empty

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

  /**
   * Records a rejection row written for this user. Returns the ids of the user's oldest rows
   * beyond maxRows, which the caller deletes, so the rows one user can accumulate stay bounded.
   */
  def recordRejectionRow(userId: String, presentationId: String, maxRows: Int): Vector[String] = {
    val rows = rejectionRows.getOrElse(userId, Vector.empty) :+ presentationId
    val (expired, kept) = rows.splitAt(math.max(rows.size - maxRows, 0))
    rejectionRows = rejectionRows.updated(userId, kept)
    expired
  }
}

object PresentationUploadTokenRateLimiter {

  // How many rejection rows to keep per user: enough for every refused file of a large
  // selection. Refused requests cost the user nothing, so older rows are deleted instead.
  val MaxRejectionRows = 100
}
