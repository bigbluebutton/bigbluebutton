package org.bigbluebutton.core.models

/**
 * Ids of presentations that were removed, or refused entry to a pod, in this meeting.
 *
 * bbb-web keeps sending conversion messages for such a presentation until its in-flight
 * work drains. Handlers consult this set so those late messages neither recreate the
 * presentation's row nor add it to a pod.
 *
 * Each meeting owns one instance (held by LiveMeeting) and it is only ever touched from
 * that meeting's single MeetingActor thread, so no locking is needed. It holds at most
 * MaxEntries ids, forgetting the oldest first: an id is needed only until bbb-web's work
 * for that presentation drains, long before that many newer ones are added.
 */
class DroppedPresentations {

  private var presentationIds: Set[String] = Set.empty

  // The same ids, oldest first.
  private var addedOrder: Vector[String] = Vector.empty

  def add(presentationId: String): Unit = {
    if (!presentationIds.contains(presentationId)) {
      presentationIds = presentationIds + presentationId
      addedOrder = addedOrder :+ presentationId
      if (addedOrder.size > DroppedPresentations.MaxEntries) {
        presentationIds = presentationIds - addedOrder.head
        addedOrder = addedOrder.tail
      }
    }
  }

  def contains(presentationId: String): Boolean = presentationIds.contains(presentationId)
}

object DroppedPresentations {

  val MaxEntries = 1000

  // The form of the ids bbb-web and bbb-apps-akka generate: a SHA-1 hex digest and a timestamp.
  private val PresentationIdPattern = "^[0-9a-f]{40}-[0-9]+$".r

  def isPresentationId(id: String): Boolean = PresentationIdPattern.matches(id)
}
