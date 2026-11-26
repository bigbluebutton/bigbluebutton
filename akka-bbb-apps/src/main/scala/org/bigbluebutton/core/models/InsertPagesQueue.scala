package org.bigbluebutton.core.models

import org.bigbluebutton.common2.domain.PresentationPageConvertedVO

/**
 * What makes an upload an insert of pages: the presentation that receives the pages (the target), the
 * position the client asked for with the totalPages it read with it, whether the client asks to be taken
 * to the first inserted page, and the current page of the target when the request was accepted.
 */
case class InsertIntent(
    targetId:       String,
    position:       Int,
    seenTotalPages: Int,
    navigate:       Boolean,
    requestPageId:  String
)

object InsertIntent {
  /** No intent: the upload is not an insert. */
  val empty: InsertIntent = InsertIntent("", 0, 0, navigate = false, "")
}

/** The stage of an insert in the queue. Ordered: an insert never goes back to an earlier stage. */
sealed abstract class InsertStage(val order: Int)

object InsertStage {
  /** From the token to the start of the POST. */
  case object Request extends InsertStage(0)
  /** From the start of the POST to the file accepted. */
  case object Transfer extends InsertStage(1)
  /** The conversion, watched for inactivity. */
  case object Conversion extends InsertStage(2)
  /** Converted and delivered, waiting for the inserts requested before it. No deadline. */
  case object Ready extends InsertStage(3)
}

/** The Ready bbb-web sent for an insert: its pages in the order of the file, and the meeting's page limit. */
case class InsertReady(pageIds: Vector[String], maxNumPages: Int)

/** One insert in progress, from the request accepted to its outcome. */
case class InsertEntry(
    uploadPresentationId: String,
    userId:               String,
    podId:                String,
    filename:             String, // in the notifications; a message id for a blank page
    intent:               InsertIntent,
    stage:                InsertStage,
    stageStartedAt:       Long,
    lastActivityAt:       Long,
    pages:                Map[String, PresentationPageConvertedVO] = Map.empty,
    ready:                Option[InsertReady]                      = None
)

/**
 * The inserts of a meeting in progress, in the order their requests were accepted. They are applied one at
 * a time, in that order; uploads and conversions run in parallel.
 */
case class InsertPagesQueue(entries: Vector[InsertEntry]) {
  def find(uploadPresentationId: String): Option[InsertEntry] = entries.find(_.uploadPresentationId == uploadPresentationId)

  def isFirst(uploadPresentationId: String): Boolean = entries.headOption.exists(_.uploadPresentationId == uploadPresentationId)

  def replace(entry: InsertEntry): InsertPagesQueue =
    copy(entries = entries.map(e => if (e.uploadPresentationId == entry.uploadPresentationId) entry else e))

  def remove(uploadPresentationId: String): InsertPagesQueue =
    copy(entries = entries.filterNot(_.uploadPresentationId == uploadPresentationId))
}

object InsertPagesQueue {
  val empty: InsertPagesQueue = InsertPagesQueue(Vector.empty)
}
