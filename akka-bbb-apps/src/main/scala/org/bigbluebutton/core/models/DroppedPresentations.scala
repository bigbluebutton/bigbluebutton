package org.bigbluebutton.core.models

/**
 * Ids of presentations that were removed, or refused entry to a pod, in this meeting.
 *
 * bbb-web keeps sending conversion messages for such a presentation until its in-flight
 * work drains. Handlers consult this set so those late messages neither recreate the
 * presentation's row nor add it to a pod.
 *
 * Each meeting owns one instance (held by LiveMeeting) and it is only ever touched from
 * that meeting's single MeetingActor thread, so no locking is needed. It lives for the
 * meeting and grows only with uploads, which are rate limited.
 */
class DroppedPresentations {

  private var presentationIds: Set[String] = Set.empty

  def add(presentationId: String): Unit = {
    presentationIds = presentationIds + presentationId
  }

  def contains(presentationId: String): Boolean = presentationIds.contains(presentationId)
}
