package org.bigbluebutton.core.models

import scala.collection.mutable

/**
 * Ids of presentations that were removed, or refused entry to a pod, in this meeting.
 *
 * bbb-web keeps sending conversion messages for such a presentation until its in-flight
 * work drains. Handlers consult this set so those late messages neither recreate the
 * presentation's row nor add it to a pod.
 *
 * Each meeting owns one instance (held by LiveMeeting) and it is only ever touched from
 * that meeting's single MeetingActor thread, so no locking is needed. Refused and removed
 * ids are kept apart, each holding at most MaxEntries ids and forgetting the oldest first:
 * an id is needed only until bbb-web's work for that presentation drains. Presenters name
 * the ids they remove, so removals can push out only other removals, never a refusal.
 */
class DroppedPresentations {

  private val refused = new DroppedPresentations.BoundedIds
  private val removed = new DroppedPresentations.BoundedIds

  def addRefused(presentationId: String): Unit = refused.add(presentationId)

  def addRemoved(presentationId: String): Unit = removed.add(presentationId)

  def contains(presentationId: String): Boolean =
    refused.contains(presentationId) || removed.contains(presentationId)
}

object DroppedPresentations {

  val MaxEntries = 1000

  private class BoundedIds {
    // Insertion ordered, so the head is the oldest id.
    private val ids = mutable.LinkedHashSet.empty[String]

    def add(id: String): Unit = {
      if (ids.add(id) && ids.size > MaxEntries) {
        ids.remove(ids.head)
      }
    }

    def contains(id: String): Boolean = ids.contains(id)
  }
}
