package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.core.models.OrderChange

object PresentationPageOrder {

  /**
   * Converts a page number the client read while the presentation had seenTotalPages pages into the
   * number of the same page in the current order. orderChanges lists, oldest first, the changes of
   * order applied to the presentation. A seen total equal to the current one, or one that is not the
   * previous total of any change (0 when unknown included), returns num unchanged.
   */
  def numNow(num: Int, seenTotalPages: Int, totalPages: Int, orderChanges: List[OrderChange]): Int = {
    if (seenTotalPages == totalPages) num
    else {
      val fromSeen = orderChanges.dropWhile(_.prevTotal != seenTotalPages)
      fromSeen.foldLeft(num) { (current, change) =>
        if (current >= change.position) current + change.count else current
      }
    }
  }
}
