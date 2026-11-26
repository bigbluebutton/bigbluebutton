package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain.PresentationPageConvertedVO
import org.bigbluebutton.core.models._

/**
 * The decisions of the insert of pages into a presentation (the target), as pure functions: whether a
 * request is accepted, the queue of the inserts in progress, and how an insert is applied to the target.
 * They take the queue, the event and the current time, and return the new queue and what happened; the
 * handlers do the side effects (database, messages, notifications) in the order of the outcomes.
 */
object PresentationInsertPages {

  /** The name of a blank page, in its progress row, in the message to bbb-web and in the notifications. */
  val BlankPageFilename = "blank.pdf"

  val StageTransfer = "transfer"
  val StageConversion = "conversion"

  /** The last part of the key of each notification (app.presentation.insertPages.error.<key>). */
  object ErrorKey {
    val Disabled = "disabled"
    val TargetNotFound = "targetNotFound"
    val UnsupportedTarget = "unsupportedTarget"
    val UnsupportedFile = "unsupportedFile"
    val PageLimit = "pageLimit"
    val Failed = "failed"
    val Timeout = "timeout"
  }

  /** The deadline of each stage, in milliseconds. */
  case class Deadlines(requestMs: Long, transferMs: Long, idleMs: Long)

  /** How an insert ended, or what else an event caused; the handlers act on each, in order. */
  sealed trait Outcome

  /**
   * The insert was applied: target is the presentation after it, with the pages from insertedAt on moved
   * forward and the inserted pages in insertedAt..; navigated tells whether the first inserted page became
   * the current page. droppedContent lists the pages whose text was dropped (it had U+0000).
   */
  case class Applied(entry: InsertEntry, target: PresentationInPod, insertedAt: Int,
                     inserted: Vector[PresentationPage], navigated: Boolean,
                     droppedContent: Vector[String]) extends Outcome

  /** The insert was refused when applied: notify key, and discard the files of these pages. */
  case class Refused(entry: InsertEntry, key: String, reason: String, discard: Vector[String]) extends Outcome

  /** bbb-web reported that the upload failed. */
  case class Failed(entry: InsertEntry, key: String, detail: String) extends Outcome

  /** The deadline of the stage passed: stop the conversion, and discard the files of these pages. */
  case class TimedOut(entry: InsertEntry, discard: Vector[String]) extends Outcome

  /** A Ready of an upload with no entry in the queue: only discard the files of these pages of targetId. */
  case class DiscardOnly(uploadPresentationId: String, targetId: String, discard: Vector[String]) extends Outcome

  /** Nothing to do; reason goes to the log. */
  case class Ignored(uploadPresentationId: String, reason: String) extends Outcome

  case class Result(queue: InsertPagesQueue, pods: PresentationPodManager, outcomes: Vector[Outcome])

  // ---------- the request ----------

  /**
   * Refuses a request for an insert, or accepts it (None). Only decides a request that has an intent, after
   * the checks the token request already makes (presentation enabled, presenter, request rate). The pod
   * cap does not apply: the pages go into a presentation that is already in the pod.
   */
  def decideToken(insertPagesEnabled: Boolean, target: Option[PresentationInPod]): Option[String] = {
    if (!insertPagesEnabled) Some(ErrorKey.Disabled)
    else target match {
      case Some(t) if !t.uploadCompleted          => Some(ErrorKey.TargetNotFound)
      // An image presentation has no PDF of its pages, which the export and the breakout read.
      case Some(t) if t.filenameConverted.isEmpty => Some(ErrorKey.UnsupportedTarget)
      case Some(_)                                => None
      case None                                   => Some(ErrorKey.TargetNotFound)
    }
  }

  /** Puts an accepted request at the end of the queue, in its first stage. */
  def enqueue(queue: InsertPagesQueue, uploadPresentationId: String, userId: String, podId: String,
              filename: String, intent: InsertIntent, stage: InsertStage, now: Long): InsertPagesQueue = {
    val entry = InsertEntry(uploadPresentationId, userId, podId, filename, intent, stage,
      stageStartedAt = now, lastActivityAt = now)
    queue.copy(entries = queue.entries :+ entry)
  }

  /**
   * The page whose size a blank page gets: the page the request saw before the requested position (the
   * first page when the position is 1 or less), in the current order, or the last page past the end.
   */
  def referencePage(target: PresentationInPod, position: Int, seenTotalPages: Int): Option[PresentationPage] = {
    val total = target.pages.size
    val requested = Math.max(1, position)
    val seenNum = if (requested > 1) requested - 1 else 1
    val num = Math.min(PresentationPageOrder.numNow(seenNum, seenTotalPages, total, target.orderChanges), total)
    target.pages.values.find(_.num == num)
  }

  // ---------- activity ----------

  private def stageOf(progressStage: String): Option[InsertStage] = progressStage match {
    case StageTransfer   => Some(InsertStage.Transfer)
    case StageConversion => Some(InsertStage.Conversion)
    case _               => None
  }

  /** A Progress: records the activity and moves the entry forward to its stage, never back. */
  def onProgress(queue: InsertPagesQueue, uploadPresentationId: String, progressStage: String,
                 now: Long): InsertPagesQueue = {
    queue.find(uploadPresentationId) match {
      case Some(entry) =>
        val forward = stageOf(progressStage).filter(s => s.order > entry.stage.order)
        val moved = forward match {
          case Some(s) => entry.copy(stage = s, stageStartedAt = now)
          case None    => entry
        }
        queue.replace(moved.copy(lastActivityAt = now))
      case None => queue
    }
  }

  /** A delivered page: kept in the entry until the outcome. Records the activity; the stage does not change. */
  def onPage(queue: InsertPagesQueue, uploadPresentationId: String, page: PresentationPageConvertedVO,
             now: Long): InsertPagesQueue = {
    queue.find(uploadPresentationId) match {
      case Some(entry) => queue.replace(entry.copy(pages = entry.pages + (page.id -> page), lastActivityAt = now))
      case None        => queue
    }
  }

  // ---------- outcomes ----------

  private def presentationsOf(pods: PresentationPodManager): Iterable[PresentationInPod] =
    pods.getAllPresentationPodsInMeeting().flatMap(_.presentations.values)

  private def findPresentation(pods: PresentationPodManager, presentationId: String): Option[PresentationInPod] =
    presentationsOf(pods).find(_.id == presentationId)

  /** The ids that no presentation of the meeting has: the only ones whose files may be deleted. */
  def discardable(pods: PresentationPodManager, pageIds: Iterable[String]): Vector[String] = {
    val live = presentationsOf(pods).flatMap(_.pages.keys).toSet
    pageIds.filterNot(live.contains).toVector.distinct
  }

  /** A Ready: ignored, kept until its turn, applied, or only a discard of its pages. */
  def onReady(queue: InsertPagesQueue, pods: PresentationPodManager, uploadPresentationId: String,
              insertIntoPresentationId: String, ready: InsertReady): Result = {
    val repeated = ready.pageIds.nonEmpty &&
      findPresentation(pods, insertIntoPresentationId).exists(t => ready.pageIds.forall(t.pages.contains))

    if (repeated) {
      Result(queue, pods, Vector(Ignored(uploadPresentationId, "repeated Ready: its pages are already in the target")))
    } else queue.find(uploadPresentationId) match {
      case None =>
        val discard = discardable(pods, ready.pageIds)
        val outcome =
          if (discard.isEmpty) Ignored(uploadPresentationId, "Ready of an upload with no insert in progress")
          else DiscardOnly(uploadPresentationId, insertIntoPresentationId, discard)
        Result(queue, pods, Vector(outcome))
      case Some(entry) if !queue.isFirst(uploadPresentationId) =>
        if (entry.stage == InsertStage.Ready) {
          Result(queue, pods, Vector(Ignored(uploadPresentationId, "second Ready of an insert waiting for its turn")))
        } else {
          val waiting = entry.copy(stage = InsertStage.Ready, ready = Some(ready))
          Result(queue.replace(waiting), pods, Vector.empty)
        }
      case Some(entry) =>
        val (newPods, outcome) = decideApply(entry, ready, pods)
        advance(Result(queue.remove(uploadPresentationId), newPods, Vector(outcome)))
    }
  }

  /** A Failed: the insert ends. */
  def onFailed(queue: InsertPagesQueue, pods: PresentationPodManager, uploadPresentationId: String,
               errorKey: String, detail: String): Result = {
    queue.find(uploadPresentationId) match {
      case Some(entry) =>
        advance(Result(queue.remove(uploadPresentationId), pods, Vector(Failed(entry, errorKey, detail))))
      case None =>
        Result(queue, pods, Vector(Ignored(uploadPresentationId, "Failed of an upload with no insert in progress")))
    }
  }

  private def deadlinePassed(entry: InsertEntry, now: Long, deadlines: Deadlines): Boolean = entry.stage match {
    case InsertStage.Request    => now - entry.stageStartedAt >= deadlines.requestMs
    case InsertStage.Transfer   => now - entry.stageStartedAt >= deadlines.transferMs
    case InsertStage.Conversion => now - entry.lastActivityAt >= deadlines.idleMs
    case InsertStage.Ready      => false
  }

  /** The audit tick: every entry whose stage deadline passed ends, then the queue moves on. */
  def onTick(queue: InsertPagesQueue, pods: PresentationPodManager, now: Long, deadlines: Deadlines): Result = {
    val expired = queue.entries.filter(deadlinePassed(_, now, deadlines))
    if (expired.isEmpty) Result(queue, pods, Vector.empty)
    else {
      val remaining = expired.foldLeft(queue)((q, e) => q.remove(e.uploadPresentationId))
      val outcomes: Vector[Outcome] = expired.map(e => TimedOut(e, discardable(pods, e.pages.keys)))
      advance(Result(remaining, pods, outcomes))
    }
  }

  /**
   * After an outcome: applies, in queue order, the first insert into each presentation while it is waiting
   * with its Ready, and stops when the first insert into every presentation has none.
   */
  def advance(result: Result): Result = {
    result.queue.firstOfEachTarget.find(e => e.stage == InsertStage.Ready && e.ready.isDefined) match {
      case Some(first) =>
        val (newPods, outcome) = decideApply(first, first.ready.get, result.pods)
        advance(Result(result.queue.remove(first.uploadPresentationId), newPods, result.outcomes :+ outcome))
      case _ => result
    }
  }

  // ---------- applying ----------

  private val PageIdPattern = "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$".r

  /** The pages of an insert after validatePages: the text of a page with U+0000 is dropped. */
  case class ValidPages(pages: Vector[PresentationPageConvertedVO], droppedContent: Vector[String])

  /**
   * Checks, before any change of state, what the database would refuse or what would break, so the insert
   * is refused instead of failing in the database after the state changed. pages are in the order of the
   * Ready. Left is the reason of the refusal, for the log.
   */
  def validatePages(target: PresentationInPod, pages: Vector[PresentationPageConvertedVO],
                    pods: PresentationPodManager): Either[String, ValidPages] = {
    val ids = pages.map(_.id)
    val otherPresentationsPageIds = presentationsOf(pods).filterNot(_.id == target.id).flatMap(_.pages.keys).toSet

    // pres_page."pageId" is the primary key: a malformed or repeated id cannot be inserted.
    if (ids.exists(id => !PageIdPattern.matches(id))) Left("page id is not a page id")
    else if (ids.distinct.size != ids.size) Left("repeated page id")
    // Not in the schema: a page in the target, or in another presentation, would change owner.
    else if (ids.exists(target.pages.contains)) Left("page already in the target")
    else if (ids.exists(otherPresentationsPageIds.contains)) Left("page of another presentation")
    // Not in the schema: the client scales by these, and a blank page needs a valid MediaBox.
    else if (pages.exists(p => !isPositiveFinite(p.width) || !isPositiveFinite(p.height))) Left("invalid page size")
    // pres_page."urlsJson" is jsonb, which cannot hold U+0000.
    else if (pages.exists(_.urls.values.exists(_.contains('\u0000')))) Left("url with U+0000")
    else {
      // pres_page."content" is text, which cannot hold U+0000: the text of that page is dropped, not refused.
      val dropped = pages.filter(_.content.contains('\u0000')).map(_.id)
      Right(ValidPages(pages.map(p => if (p.content.contains('\u0000')) p.copy(content = "") else p), dropped))
    }
  }

  private def isPositiveFinite(d: Double): Boolean = !d.isNaN && !d.isInfinite && d > 0

  /**
   * Applies an insert to its target: the checks, in order, then the new state of the target. Returns the
   * pods after it (unchanged when refused) and the outcome.
   */
  def decideApply(entry: InsertEntry, ready: InsertReady, pods: PresentationPodManager): (PresentationPodManager, Outcome) = {
    def refuse(key: String, reason: String): (PresentationPodManager, Outcome) =
      (pods, Refused(entry, key, reason, discardable(pods, ready.pageIds)))

    val pod = pods.getPod(entry.podId)
    val target = pod.flatMap(_.getPresentation(entry.intent.targetId))

    if (ready.pageIds.isEmpty || ready.pageIds.exists(id => !entry.pages.contains(id))) {
      refuse(ErrorKey.Failed, "the Ready lists no page, or a page that did not arrive")
    } else if (target.isEmpty) {
      refuse(ErrorKey.TargetNotFound, "the target is not in the pod")
    } else {
      val t = target.get
      validatePages(t, ready.pageIds.map(entry.pages), pods) match {
        case Left(reason) => refuse(ErrorKey.Failed, reason)
        case Right(valid) =>
          val n = t.pages.size
          val count = valid.pages.size
          if (n + count > ready.maxNumPages) refuse(ErrorKey.PageLimit, s"$n + $count pages > ${ready.maxNumPages}")
          else {
            val (newTarget, insertedAt, inserted, navigated) = insert(t, valid.pages, entry, pod.get)
            val newPods = pods.updatePresentationPod(pod.get.addPresentation(newTarget))
            (newPods, Applied(entry, newTarget, insertedAt, inserted, navigated, valid.droppedContent))
          }
      }
    }
  }

  /** The page ids of a presentation in page order: after an insert, what the recording keeps. */
  def pageIdsInOrder(presentation: PresentationInPod): Vector[String] =
    presentation.pages.values.toVector.sortBy(_.num).map(_.id)

  /**
   * The target with the pages inserted. The requested position is at least 1, converted to the current order
   * from the total the request saw, and at most N + 1. The client is taken to the first inserted page only if
   * it asked, is still the presenter of the pod, the target is still the current presentation, and its
   * current page is still the one of the request.
   */
  private def insert(target: PresentationInPod, pages: Vector[PresentationPageConvertedVO], entry: InsertEntry,
                     pod: PresentationPod): (PresentationInPod, Int, Vector[PresentationPage], Boolean) = {
    val n = target.pages.size
    val count = pages.size
    val requested = Math.max(1, entry.intent.position)
    val converted = PresentationPageOrder.numNow(requested, entry.intent.seenTotalPages, n, target.orderChanges)
    val insertedAt = Math.min(converted, n + 1)

    val currentPage = PresentationInPod.getCurrentPage(target)
    val navigated = entry.intent.navigate &&
      pod.currentPresenter == entry.userId &&
      target.current &&
      currentPage.exists(_.id == entry.intent.requestPageId)

    val moved = target.pages.values.map { p =>
      val num = if (p.num >= insertedAt) p.num + count else p.num
      val current = if (navigated) false else p.current
      p.copy(num = num, current = current)
    }
    val inserted = pages.zipWithIndex.map {
      case (vo, i) =>
        PresentationPage(vo.id, insertedAt + i, vo.urls, vo.content, current = navigated && i == 0,
          width = vo.width, height = vo.height, converted = true, pageToken = vo.pageToken)
    }
    val newTarget = target.copy(
      pages = (moved ++ inserted).map(p => p.id -> p).toMap,
      numPages = n + count,
      orderChanges = target.orderChanges :+ OrderChange(n, insertedAt, count)
    )
    (newTarget, insertedAt, inserted, navigated)
  }
}
