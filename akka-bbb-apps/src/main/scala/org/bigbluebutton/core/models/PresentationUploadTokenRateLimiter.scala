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

  // userId -> ascending timestamps (ms) of recent rate-limit rejection rows written for that user
  private var rateLimitRowTimestamps: Map[String, Vector[Long]] = Map.empty

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
   * Returns true, and records nowMs, while fewer than maxRows rate-limit rejection rows were
   * written for this user within the last windowMs. A refused request costs the user nothing,
   * so this bounds the database writes that refused requests can cause.
   */
  def allowRateLimitRow(userId: String, nowMs: Long, maxRows: Int, windowMs: Long): Boolean = {
    val recent = rateLimitRowTimestamps.getOrElse(userId, Vector.empty).filter(_ > nowMs - windowMs)
    val allowed = recent.size < maxRows
    rateLimitRowTimestamps = rateLimitRowTimestamps.updated(userId, if (allowed) recent :+ nowMs else recent)
    allowed
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

  // Matches the default of apps.presentationUploadTokenMaxRequests.
  private val DefaultMaxRequests = 20

  // Rate-limit rejection rows written per user per window: enough for every refused file of a
  // large selection. Further refused files in the window get no row.
  val MaxRateLimitRowsPerWindow = 100

  /**
   * How many rejection rows to keep per user: every row one window can produce, which is one
   * per admitted request (pod-full refusals) plus MaxRateLimitRowsPerWindow. Rows are deleted
   * oldest first, so none written within the current window is deleted. With the limit
   * disabled nothing bounds pod-full refusals, so keep the default limit's worth.
   */
  def maxRejectionRows(maxRequests: Int): Int =
    (if (maxRequests > 0) maxRequests else DefaultMaxRequests) + MaxRateLimitRowsPerWindow
}
