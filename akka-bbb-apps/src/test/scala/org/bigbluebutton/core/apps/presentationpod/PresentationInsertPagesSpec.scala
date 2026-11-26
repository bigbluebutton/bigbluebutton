package org.bigbluebutton.core.apps.presentationpod

import java.util.UUID

import org.bigbluebutton.common2.domain.PresentationPageConvertedVO
import org.bigbluebutton.core.apps.presentationpod.PresentationInsertPages._
import org.bigbluebutton.core.models._
import org.scalatest.flatspec.AnyFlatSpec

import scala.reflect.ClassTag

// Exercises the pure decisions of the insert of pages (PresentationInsertPages): no handler, no database.
// The state is hand-built; nothing here calls PresentationPod.setCurrentPage or
// PresentationInPod.makePageCurrent, which write to the database.
class PresentationInsertPagesSpec extends AnyFlatSpec {

  // ---------- fixtures ----------

  private val podId = PresentationPod.DEFAULT_PRESENTATION_POD
  private val presenter = "presenter-user"
  private val targetId = "target-presentation"
  private val otherId = "other-presentation"
  private val t0 = 1000000L
  private val deadlines = Deadlines(requestMs = 1000L, transferMs = 2000L, idleMs = 3000L)

  private def uuid(): String = UUID.randomUUID().toString

  private def uuids(n: Int): Vector[String] = Vector.fill(n)(uuid())

  /** A converted PDF presentation of n pages numbered 1..n; currentNum, if given, is its current page. */
  private def presentation(id: String, n: Int, current: Boolean = false, currentNum: Option[Int] = None,
                           orderChanges: List[OrderChange] = List.empty): PresentationInPod = {
    val pages = (1 to n).map { num =>
      val pageId = uuid()
      pageId -> PresentationPage(pageId, num, Map("svg" -> s"http://x/$num.svg"), s"text $num",
        current = currentNum.contains(num), converted = true)
    }.toMap
    PresentationInPod(
      id = id,
      name = s"$id.pdf",
      current = current,
      pages = pages,
      downloadable = false,
      removable = true,
      filenameConverted = s"$id.pdf",
      uploadCompleted = true,
      numPages = n,
      errorDetails = Map.empty,
      orderChanges = orderChanges
    )
  }

  private def idAt(pres: PresentationInPod, num: Int): String = pres.pages.values.find(_.num == num).get.id

  private def podsWith(presentations: PresentationInPod*): PresentationPodManager =
    podsWithPresenter(presenter, presentations: _*)

  private def podsWithPresenter(presenterId: String, presentations: PresentationInPod*): PresentationPodManager = {
    val pod = presentations.foldLeft(PresentationPod(podId, presenterId, Map.empty))(_ addPresentation _)
    PresentationPodManager(Map(podId -> pod))
  }

  private def targetOf(pods: PresentationPodManager, id: String = targetId): PresentationInPod =
    pods.getPod(podId).get.getPresentation(id).get

  private def vo(id: String, current: Boolean = false, width: Double = 1440D, height: Double = 1080D,
                 content: String = "page text", urls: Map[String, String] = Map("svg" -> "http://x/p.svg")): PresentationPageConvertedVO =
    PresentationPageConvertedVO(id, 1, urls, content, current, width, height, "token")

  private def intent(position: Int, seenTotalPages: Int, navigate: Boolean = false, requestPageId: String = "",
                     target: String = targetId): InsertIntent =
    InsertIntent(target, position, seenTotalPages, navigate, requestPageId)

  /** Enqueues an insert in Conversion and delivers its pages. */
  private def withEntry(queue: InsertPagesQueue, uploadId: String, in: InsertIntent,
                        pages: Seq[PresentationPageConvertedVO], now: Long = t0,
                        userId: String = presenter): InsertPagesQueue = {
    val queued = enqueue(queue, uploadId, userId, podId, "file.pdf", in, InsertStage.Conversion, now)
    pages.foldLeft(queued)((q, p) => onPage(q, uploadId, p, now))
  }

  /** A single insert of the given pages, delivered and then Ready. */
  private def insertOne(pods: PresentationPodManager, in: InsertIntent, pages: Seq[PresentationPageConvertedVO],
                        maxNumPages: Int = 100, userId: String = presenter,
                        readyIds: Option[Vector[String]] = None): Result = {
    val queue = withEntry(InsertPagesQueue.empty, "upload-1", in, pages, userId = userId)
    onReady(queue, pods, "upload-1", in.targetId, InsertReady(readyIds.getOrElse(pages.map(_.id).toVector), maxNumPages))
  }

  private def as[T <: Outcome: ClassTag](outcome: Outcome): T = outcome match {
    case t: T => t
    case o    => fail(s"unexpected outcome $o")
  }

  private def only[T <: Outcome: ClassTag](result: Result): T = {
    assert(result.outcomes.size == 1, s"outcomes: ${result.outcomes}")
    as[T](result.outcomes.head)
  }

  private def applied(result: Result): Applied = only[Applied](result)

  private def nums(pres: PresentationInPod, ids: Seq[String]): Seq[Int] = ids.map(id => pres.pages(id).num)

  // ---------- Ac-B 11 ----------

  behavior of "PresentationInsertPages.decideToken"

  it should "Ac-B 11: refuse with disabled when the flag is off, before any other check" in {
    assert(decideToken(insertPagesEnabled = false, Some(presentation(targetId, 3))).contains(ErrorKey.Disabled))
    assert(decideToken(insertPagesEnabled = false, None).contains(ErrorKey.Disabled))
  }

  it should "Ac-B 11: refuse with targetNotFound when there is no target" in {
    assert(decideToken(insertPagesEnabled = true, None).contains(ErrorKey.TargetNotFound))
  }

  it should "Ac-B 11: refuse with targetNotFound when the target did not finish its upload" in {
    val target = presentation(targetId, 3).copy(uploadCompleted = false, filenameConverted = "")
    assert(decideToken(insertPagesEnabled = true, Some(target)).contains(ErrorKey.TargetNotFound))
  }

  it should "Ac-B 11: refuse with unsupportedTarget when the target has no converted PDF" in {
    val target = presentation(targetId, 3).copy(filenameConverted = "")
    assert(decideToken(insertPagesEnabled = true, Some(target)).contains(ErrorKey.UnsupportedTarget))
  }

  it should "Ac-B 11: accept a converted PDF target, even from a pod holding many presentations" in {
    val many = (1 to 50).map(i => presentation(s"pres-$i", 2))
    val pods = podsWith(many :+ presentation(targetId, 3): _*)
    assert(pods.getPod(podId).get.getPresentationsSize() == 51)
    assert(decideToken(insertPagesEnabled = true, Some(targetOf(pods))).isEmpty)
  }

  // ---------- Ac-B 13 ----------

  behavior of "PresentationInsertPages.onReady classification"

  it should "Ac-B 13: ignore a repeated Ready whose pages are all in the target, with the queue unchanged" in {
    val target = presentation(targetId, 3)
    val pods = podsWith(target)
    val ids = Vector(idAt(target, 1), idAt(target, 2))
    val queue = withEntry(InsertPagesQueue.empty, "upload-1", intent(1, 3), ids.map(vo(_)))
    val result = onReady(queue, pods, "upload-1", targetId, InsertReady(ids, 100))
    assert(only[Ignored](result).uploadPresentationId == "upload-1")
    assert(result.queue == queue)
    assert(result.pods == pods)
  }

  it should "Ac-B 13: only discard the pages of a Ready with no entry that no presentation has" in {
    val target = presentation(targetId, 3)
    val other = presentation(otherId, 2)
    val pods = podsWith(target, other)
    val fresh = uuid()
    val result = onReady(InsertPagesQueue.empty, pods, "upload-x", targetId,
      InsertReady(Vector(fresh, idAt(other, 1), idAt(target, 1)), 100))
    assert(only[DiscardOnly](result) == DiscardOnly("upload-x", targetId, Vector(fresh)))
    assert(result.queue == InsertPagesQueue.empty)
    assert(result.pods == pods)
  }

  it should "Ac-B 13: ignore a Ready with no entry when every page belongs to a presentation" in {
    val target = presentation(targetId, 3)
    val other = presentation(otherId, 2)
    val pods = podsWith(target, other)
    val result = onReady(InsertPagesQueue.empty, pods, "upload-x", targetId,
      InsertReady(Vector(idAt(other, 1), idAt(other, 2)), 100))
    assert(only[Ignored](result).uploadPresentationId == "upload-x")
    val empty = onReady(InsertPagesQueue.empty, pods, "upload-x", targetId, InsertReady(Vector.empty, 100))
    assert(only[Ignored](empty).uploadPresentationId == "upload-x")
  }

  it should "Ac-B 13: leave the queue unchanged for a page of an upload with no entry" in {
    val queue = withEntry(InsertPagesQueue.empty, "upload-1", intent(1, 3), Seq(vo(uuid())))
    assert(onPage(queue, "upload-x", vo(uuid()), t0 + 10) == queue)
    assert(onPage(InsertPagesQueue.empty, "upload-x", vo(uuid()), t0) == InsertPagesQueue.empty)
  }

  it should "Ac-B 13: ignore a second Ready of an entry already waiting in stage Ready" in {
    val pods = podsWith(presentation(targetId, 3))
    val first = withEntry(InsertPagesQueue.empty, "upload-1", intent(1, 3), Seq(vo(uuid())))
    val secondPages = Seq(vo(uuid()))
    val queue = withEntry(first, "upload-2", intent(1, 3), secondPages)
    val ready = InsertReady(secondPages.map(_.id).toVector, 100)
    val stored = onReady(queue, pods, "upload-2", targetId, ready)
    assert(stored.outcomes.isEmpty)
    val again = onReady(stored.queue, pods, "upload-2", targetId, ready)
    assert(only[Ignored](again).uploadPresentationId == "upload-2")
    assert(again.queue == stored.queue)
  }

  // ---------- Ac-B 14 ----------

  behavior of "PresentationInsertPages.decideApply through onReady"

  it should "Ac-B 14: refuse with failed and an empty discard a Ready with no page" in {
    val pods = podsWith(presentation(targetId, 3))
    val result = insertOne(pods, intent(1, 3), Seq(vo(uuid())), readyIds = Some(Vector.empty))
    val refused = only[Refused](result)
    assert(refused.key == ErrorKey.Failed)
    assert(refused.discard.isEmpty)
    assert(result.pods == pods)
    assert(result.queue.entries.isEmpty)
  }

  it should "Ac-B 14: refuse with failed a Ready citing a page that never arrived" in {
    val pods = podsWith(presentation(targetId, 3))
    val arrived = uuid()
    val missing = uuid()
    val result = insertOne(pods, intent(1, 3), Seq(vo(arrived)), readyIds = Some(Vector(arrived, missing)))
    val refused = only[Refused](result)
    assert(refused.key == ErrorKey.Failed)
    assert(refused.discard == Vector(arrived, missing))
    assert(result.pods == pods)
  }

  it should "Ac-B 14: refuse with targetNotFound when the target was removed from the pod" in {
    val pods = podsWith(presentation(otherId, 2))
    val result = insertOne(pods, intent(1, 3), Seq(vo(uuid())))
    assert(only[Refused](result).key == ErrorKey.TargetNotFound)
    assert(result.pods == pods)
  }

  it should "Ac-B 14: refuse with failed when validatePages finds a problem" in {
    val pods = podsWith(presentation(targetId, 3))
    val result = insertOne(pods, intent(1, 3), Seq(vo(uuid(), width = 0)))
    assert(only[Refused](result).key == ErrorKey.Failed)
    assert(result.pods == pods)
  }

  it should "Ac-B 14: refuse with pageLimit when N + count exceeds maxNumPages, and accept it at the limit" in {
    val pods = podsWith(presentation(targetId, 3))
    val pages = uuids(2).map(vo(_))
    val over = insertOne(pods, intent(1, 3), pages, maxNumPages = 4)
    val refused = only[Refused](over)
    assert(refused.key == ErrorKey.PageLimit)
    assert(refused.discard.toSet == pages.map(_.id).toSet)
    assert(over.pods == pods)
    assert(applied(insertOne(pods, intent(1, 3), pages, maxNumPages = 5)).target.numPages == 5)
  }

  it should "Ac-B 14: insert at 1 for position 0 or negative" in {
    val target = presentation(targetId, 3)
    val pods = podsWith(target)
    Seq(0, -5, 1).foreach { position =>
      val pages = uuids(2).map(vo(_))
      val a = applied(insertOne(pods, intent(position, 3), pages))
      assert(a.insertedAt == 1, s"position $position")
      assert(nums(a.target, pages.map(_.id)) == Seq(1, 2))
      assert(nums(a.target, (1 to 3).map(idAt(target, _))) == Seq(3, 4, 5))
    }
  }

  it should "Ac-B 14: insert in the middle, moving the pages at and after the position" in {
    val target = presentation(targetId, 3)
    val pages = uuids(2).map(vo(_))
    val a = applied(insertOne(podsWith(target), intent(2, 3), pages))
    assert(a.insertedAt == 2)
    assert(nums(a.target, pages.map(_.id)) == Seq(2, 3))
    assert(nums(a.target, (1 to 3).map(idAt(target, _))) == Seq(1, 4, 5))
    assert(a.inserted.map(_.num) == Vector(2, 3))
  }

  it should "Ac-B 14: insert at N + 1, and clamp a larger position to N + 1" in {
    val target = presentation(targetId, 3)
    Seq(4, 5, 100).foreach { position =>
      val pages = uuids(2).map(vo(_))
      val a = applied(insertOne(podsWith(target), intent(position, 3), pages))
      assert(a.insertedAt == 4, s"position $position")
      assert(nums(a.target, pages.map(_.id)) == Seq(4, 5))
      assert(nums(a.target, (1 to 3).map(idAt(target, _))) == Seq(1, 2, 3))
    }
  }

  it should "Ac-B 14: put a second insert at position 0 with the same seen total after the first" in {
    val target = presentation(targetId, 3)
    val pods = podsWith(target)
    val first = uuids(2).map(vo(_))
    val second = uuids(1).map(vo(_))
    val queue = withEntry(withEntry(InsertPagesQueue.empty, "upload-1", intent(0, 3), first), "upload-2",
      intent(0, 3), second)
    // The second Ready arrives first: it waits for the first.
    val stored = onReady(queue, pods, "upload-2", targetId, InsertReady(second.map(_.id), 100))
    assert(stored.outcomes.isEmpty)
    val result = onReady(stored.queue, stored.pods, "upload-1", targetId, InsertReady(first.map(_.id), 100))
    assert(result.outcomes.size == 2)
    val a1 = as[Applied](result.outcomes(0))
    val a2 = as[Applied](result.outcomes(1))
    assert(a1.entry.uploadPresentationId == "upload-1" && a1.insertedAt == 1)
    assert(a2.entry.uploadPresentationId == "upload-2" && a2.insertedAt == 3)
    val finalTarget = targetOf(result.pods)
    assert(nums(finalTarget, first.map(_.id) ++ second.map(_.id)) == Seq(1, 2, 3))
    assert(nums(finalTarget, (1 to 3).map(idAt(target, _))) == Seq(4, 5, 6))
    assert(finalTarget.numPages == 6)
    assert(finalTarget.orderChanges == List(OrderChange(3, 1, 2), OrderChange(5, 3, 1)))
    assert(result.queue.entries.isEmpty)
  }

  it should "Ac-B 14: convert the position through orderChanges when the seen total is older" in {
    // The target had 3 pages; 2 entered at 1 (3 -> 5). The request saw 3 pages and asked for position 2.
    val target = presentation(targetId, 5, orderChanges = List(OrderChange(3, 1, 2)))
    val pages = uuids(1).map(vo(_))
    val a = applied(insertOne(podsWith(target), intent(2, 3), pages))
    assert(a.insertedAt == 4)
    assert(a.target.orderChanges == List(OrderChange(3, 1, 2), OrderChange(5, 4, 1)))
  }

  it should "Ac-B 14: enter every page converted and not current, with numPages and orderChanges updated" in {
    val target = presentation(targetId, 3, current = true, currentNum = Some(2))
    val pages = Seq(vo(uuid(), current = true), vo(uuid()))
    val result = insertOne(podsWith(target), intent(2, 3), pages)
    val a = applied(result)
    assert(targetOf(result.pods) == a.target)
    assert(!a.navigated)
    assert(a.inserted.forall(p => !p.current && p.converted))
    assert(a.inserted.map(_.id) == pages.map(_.id).toVector)
    assert(pages.forall(p => !a.target.pages(p.id).current && a.target.pages(p.id).converted))
    assert(a.target.numPages == 5)
    assert(a.target.pages.size == 5)
    assert(a.target.orderChanges == List(OrderChange(3, 2, 2)))
    assert(PresentationInPod.getCurrentPage(a.target).map(_.id).contains(idAt(target, 2)))
    assert(nums(a.target, (1 to 3).map(idAt(target, _))) == Seq(1, 4, 5))
  }

  // ---------- Ac-B 15 ----------

  behavior of "PresentationInsertPages navigation"

  private val navTarget = presentation(targetId, 3, current = true, currentNum = Some(2))
  private val navRequestPage = idAt(navTarget, 2)

  private def navInsert(navigate: Boolean = true, podPresenter: String = presenter, targetCurrent: Boolean = true,
                        requestPageId: String = navRequestPage): (Applied, Seq[String]) = {
    val pages = uuids(2).map(vo(_))
    val pods = podsWithPresenter(podPresenter, navTarget.copy(current = targetCurrent))
    (applied(insertOne(pods, intent(2, 3, navigate, requestPageId), pages)), pages.map(_.id))
  }

  private def assertNotNavigated(a: Applied): Unit = {
    assert(!a.navigated)
    assert(a.target.pages.values.filter(_.current).map(_.id).toList == List(navRequestPage))
  }

  it should "Ac-B 15: take the presenter to the first inserted page when every condition holds" in {
    val (a, ids) = navInsert()
    assert(a.navigated)
    assert(a.target.pages.values.filter(_.current).map(_.id).toList == List(ids.head))
    assert(a.inserted.map(_.current) == Vector(true, false))
  }

  it should "Ac-B 15: not navigate when the client did not ask" in {
    assertNotNavigated(navInsert(navigate = false)._1)
  }

  it should "Ac-B 15: not navigate when the user is no longer the presenter of the pod" in {
    assertNotNavigated(navInsert(podPresenter = "someone-else")._1)
  }

  it should "Ac-B 15: not navigate when the target is not the current presentation" in {
    assertNotNavigated(navInsert(targetCurrent = false)._1)
  }

  it should "Ac-B 15: not navigate when the current page is not the one of the request" in {
    assertNotNavigated(navInsert(requestPageId = idAt(navTarget, 3))._1)
  }

  // ---------- Ac-B 16 ----------

  behavior of "PresentationInsertPages.validatePages"

  private def assertInvalid(pages: Vector[PresentationPageConvertedVO], target: PresentationInPod,
                            pods: PresentationPodManager): Unit = {
    assert(validatePages(target, pages, pods).isLeft, s"pages $pages")
    val result = insertOne(pods, intent(1, target.pages.size), pages)
    assert(only[Refused](result).key == ErrorKey.Failed)
    assert(result.pods == pods)
    assert(targetOf(result.pods) == target)
  }

  private val valTarget = presentation(targetId, 3)
  private val valOther = presentation(otherId, 2)
  private val valPods = podsWith(valTarget, valOther)

  it should "Ac-B 16: refuse an id that is not a page id" in {
    Seq("not-a-uuid", uuid().toUpperCase, "1234-abc/1", "").foreach { id =>
      assertInvalid(Vector(vo(id)), valTarget, valPods)
    }
    assert(validatePages(valTarget, Vector(vo("not-a-uuid")), valPods) == Left("page id is not a page id"))
  }

  it should "Ac-B 16: refuse a repeated id" in {
    val id = uuid()
    assert(validatePages(valTarget, Vector(vo(id), vo(id)), valPods) == Left("repeated page id"))
  }

  it should "Ac-B 16: refuse an id already in the target" in {
    assert(validatePages(valTarget, Vector(vo(uuid()), vo(idAt(valTarget, 1))), valPods) ==
      Left("page already in the target"))
  }

  it should "Ac-B 16: refuse an id of another presentation" in {
    assert(validatePages(valTarget, Vector(vo(idAt(valOther, 1))), valPods) == Left("page of another presentation"))
    assertInvalid(Vector(vo(uuid()), vo(idAt(valOther, 2))), valTarget, valPods)
  }

  it should "Ac-B 16: refuse a width or height that is NaN, infinite, 0 or negative" in {
    val bad = Seq(Double.NaN, Double.PositiveInfinity, Double.NegativeInfinity, 0D, -1D)
    bad.foreach { d =>
      assert(validatePages(valTarget, Vector(vo(uuid(), width = d)), valPods) == Left("invalid page size"), s"width $d")
      assert(validatePages(valTarget, Vector(vo(uuid(), height = d)), valPods) == Left("invalid page size"), s"height $d")
      assertInvalid(Vector(vo(uuid(), width = d)), valTarget, valPods)
      assertInvalid(Vector(vo(uuid(), height = d)), valTarget, valPods)
    }
  }

  it should "Ac-B 16: refuse a url containing U+0000" in {
    val pages = Vector(vo(uuid(), urls = Map("svg" -> "http://x/a\u0000.svg")))
    assert(validatePages(valTarget, pages, valPods) == Left("url with U+0000"))
    assertInvalid(pages, valTarget, valPods)
  }

  it should "Ac-B 16: drop the content with U+0000 and list it, without refusing" in {
    val bad = vo(uuid(), content = "a\u0000b")
    val good = vo(uuid(), content = "fine")
    validatePages(valTarget, Vector(bad, good), valPods) match {
      case Right(valid) =>
        assert(valid.droppedContent == Vector(bad.id))
        assert(valid.pages.map(_.content) == Vector("", "fine"))
      case Left(reason) => fail(reason)
    }
    val a = applied(insertOne(valPods, intent(1, 3), Seq(bad, good)))
    assert(a.droppedContent == Vector(bad.id))
    assert(a.target.pages(bad.id).content == "")
    assert(a.target.pages(good.id).content == "fine")
  }

  it should "Ac-B 16: refuse a partial overlap with the target, discarding only the ids of no presentation" in {
    val fresh = uuid()
    val result = insertOne(valPods, intent(1, 3), Seq(vo(fresh), vo(idAt(valTarget, 1))))
    val refused = only[Refused](result)
    assert(refused.key == ErrorKey.Failed)
    assert(refused.discard == Vector(fresh))
    assert(result.pods == valPods)
  }

  it should "Ac-B 16: discard nothing when every id of a refused insert belongs to a presentation" in {
    val result = insertOne(valPods, intent(1, 3), Seq(vo(idAt(valTarget, 1)), vo(idAt(valOther, 1))))
    val refused = only[Refused](result)
    assert(refused.key == ErrorKey.Failed)
    assert(refused.discard.isEmpty)
    assert(result.pods == valPods)
  }

  // ---------- Ac-B 19 ----------

  behavior of "PresentationInsertPages stages and deadlines"

  private val noPods = podsWith(presentation(targetId, 3))

  private def queued(stage: InsertStage, now: Long = t0, uploadId: String = "upload-1"): InsertPagesQueue =
    enqueue(InsertPagesQueue.empty, uploadId, presenter, podId, "file.pdf", intent(1, 3), stage, now)

  private def assertExpiresAt(queue: InsertPagesQueue, at: Long): Unit = {
    val before = onTick(queue, noPods, at - 1, deadlines)
    assert(before.outcomes.isEmpty)
    assert(before.queue == queue)
    val expired = onTick(queue, noPods, at, deadlines)
    val timedOut = only[TimedOut](expired)
    assert(timedOut.entry.uploadPresentationId == "upload-1")
    assert(timedOut.entry == queue.entries.head)
    assert(expired.queue.entries.isEmpty)
  }

  it should "Ac-B 19: expire a Request at requestMs from stageStartedAt, not 1 ms before" in {
    assertExpiresAt(queued(InsertStage.Request), t0 + 1000)
  }

  it should "Ac-B 19: count a Request from stageStartedAt even with later activity" in {
    val q = onProgress(queued(InsertStage.Request), "upload-1", "other", t0 + 900)
    assert(q.entries.head.stage == InsertStage.Request)
    assert(q.entries.head.lastActivityAt == t0 + 900)
    assertExpiresAt(q, t0 + 1000)
  }

  it should "Ac-B 19: expire a Transfer at transferMs from stageStartedAt, not from the last activity" in {
    val q1 = onProgress(queued(InsertStage.Request), "upload-1", StageTransfer, t0 + 500)
    val q2 = onProgress(q1, "upload-1", StageTransfer, t0 + 1500)
    assert(q2.entries.head.stage == InsertStage.Transfer)
    assert(q2.entries.head.stageStartedAt == t0 + 500)
    assert(q2.entries.head.lastActivityAt == t0 + 1500)
    assertExpiresAt(q2, t0 + 500 + 2000)
  }

  it should "Ac-B 19: expire a Conversion at idleMs from lastActivityAt, rearmed by progress and pages" in {
    val q1 = onProgress(queued(InsertStage.Transfer), "upload-1", StageConversion, t0 + 100)
    assert(q1.entries.head.stage == InsertStage.Conversion)
    assertExpiresAt(q1, t0 + 100 + 3000)
    val q2 = onProgress(q1, "upload-1", StageConversion, t0 + 2000)
    assertExpiresAt(q2, t0 + 2000 + 3000)
    val q3 = onPage(q2, "upload-1", vo(uuid()), t0 + 4000)
    assert(q3.entries.head.stageStartedAt == t0 + 100)
    assertExpiresAt(q3, t0 + 4000 + 3000)
  }

  it should "Ac-B 19: move forward request -> transfer -> conversion, never back, and rearm the activity" in {
    val q0 = queued(InsertStage.Request)
    val q1 = onProgress(q0, "upload-1", StageTransfer, t0 + 10)
    assert(q1.entries.head.stage == InsertStage.Transfer)
    assert(q1.entries.head.stageStartedAt == t0 + 10)
    val q2 = onProgress(q1, "upload-1", StageConversion, t0 + 20)
    assert(q2.entries.head.stage == InsertStage.Conversion)
    assert(q2.entries.head.stageStartedAt == t0 + 20)
    val q3 = onProgress(q2, "upload-1", StageTransfer, t0 + 30)
    assert(q3.entries.head.stage == InsertStage.Conversion)
    assert(q3.entries.head.stageStartedAt == t0 + 20)
    assert(q3.entries.head.lastActivityAt == t0 + 30)
    // A progress of an upload with no entry changes nothing.
    assert(onProgress(q3, "upload-x", StageConversion, t0 + 40) == q3)
  }

  it should "Ac-B 19: store a page and rearm the activity without changing the stage" in {
    val q0 = queued(InsertStage.Transfer)
    val page = vo(uuid())
    val q1 = onPage(q0, "upload-1", page, t0 + 700)
    val e = q1.entries.head
    assert(e.stage == InsertStage.Transfer)
    assert(e.stageStartedAt == t0)
    assert(e.lastActivityAt == t0 + 700)
    assert(e.pages == Map(page.id -> page))
  }

  it should "Ac-B 19: never expire an entry in stage Ready" in {
    val q = queued(InsertStage.Ready)
    val result = onTick(q, noPods, Long.MaxValue / 2, deadlines)
    assert(result.outcomes.isEmpty)
    assert(result.queue == q)
  }

  it should "Ac-B 19: store a Ready for an entry that is not the first, in stage Ready" in {
    val pages = Seq(vo(uuid()))
    val q = withEntry(queued(InsertStage.Conversion), "upload-2", intent(1, 3), pages)
    val ready = InsertReady(pages.map(_.id).toVector, 100)
    val result = onReady(q, noPods, "upload-2", targetId, ready)
    assert(result.outcomes.isEmpty)
    assert(result.pods == noPods)
    val stored = result.queue.find("upload-2").get
    assert(stored.stage == InsertStage.Ready)
    assert(stored.ready.contains(ready))
    assert(result.queue.entries.map(_.uploadPresentationId) == Vector("upload-1", "upload-2"))
    // Waiting with its Ready, it does not expire while the first does.
    val tick = onTick(result.queue, noPods, t0 + 1000000, deadlines)
    assert(tick.outcomes.size == 2)
    assert(tick.outcomes.head.isInstanceOf[TimedOut])
    assert(tick.outcomes(1).isInstanceOf[Applied])
  }

  it should "Ac-B 19: expire a blank page enqueued in Conversion with no progress at idleMs from the enqueue" in {
    assertExpiresAt(queued(InsertStage.Conversion, now = t0 + 50), t0 + 50 + 3000)
  }

  // ---------- Ac-B 20 ----------

  behavior of "PresentationInsertPages.advance"

  it should "Ac-B 20: after the first fails, apply only the waiting second; the fourth waits for the third" in {
    val target = presentation(targetId, 3)
    val pods = podsWith(target)
    val pagesOf = (1 to 4).map(i => s"upload-$i" -> uuids(1).map(vo(_))).toMap
    val queue = (1 to 4).foldLeft(InsertPagesQueue.empty) { (q, i) =>
      withEntry(q, s"upload-$i", intent(1, 3), pagesOf(s"upload-$i"))
    }
    val s2 = onReady(queue, pods, "upload-2", targetId, InsertReady(pagesOf("upload-2").map(_.id), 100))
    val s4 = onReady(s2.queue, s2.pods, "upload-4", targetId, InsertReady(pagesOf("upload-4").map(_.id), 100))
    assert(s2.outcomes.isEmpty && s4.outcomes.isEmpty)

    val failed = onFailed(s4.queue, s4.pods, "upload-1", ErrorKey.UnsupportedFile, "bad file")
    assert(failed.outcomes.size == 2)
    failed.outcomes.head match {
      case f: Failed =>
        assert(f.entry.uploadPresentationId == "upload-1")
        assert(f.key == ErrorKey.UnsupportedFile)
        assert(f.detail == "bad file")
      case o => fail(s"unexpected $o")
    }
    failed.outcomes(1) match {
      case a: Applied => assert(a.entry.uploadPresentationId == "upload-2")
      case o          => fail(s"unexpected $o")
    }
    assert(failed.queue.entries.map(_.uploadPresentationId) == Vector("upload-3", "upload-4"))
    assert(failed.queue.find("upload-4").get.stage == InsertStage.Ready)
    assert(targetOf(failed.pods).pages.contains(pagesOf("upload-2").head.id))
    assert(!targetOf(failed.pods).pages.contains(pagesOf("upload-4").head.id))

    val third = onReady(failed.queue, failed.pods, "upload-3", targetId, InsertReady(pagesOf("upload-3").map(_.id), 100))
    assert(third.outcomes.map(_.asInstanceOf[Applied].entry.uploadPresentationId) == Vector("upload-3", "upload-4"))
    assert(third.queue.entries.isEmpty)
    assert(targetOf(third.pods).numPages == 6)
  }

  it should "Ac-B 20: keep advancing past a stored Ready refused with pageLimit" in {
    val pods = podsWith(presentation(targetId, 3))
    val p2 = uuids(2).map(vo(_))
    val p3 = uuids(1).map(vo(_))
    val q = withEntry(withEntry(
      withEntry(InsertPagesQueue.empty, "upload-1", intent(1, 3), Seq(vo(uuid()))),
      "upload-2", intent(1, 3), p2
    ), "upload-3", intent(1, 3), p3)
    val s2 = onReady(q, pods, "upload-2", targetId, InsertReady(p2.map(_.id), 4))
    val s3 = onReady(s2.queue, s2.pods, "upload-3", targetId, InsertReady(p3.map(_.id), 4))
    val result = onFailed(s3.queue, s3.pods, "upload-1", ErrorKey.Failed, "")
    assert(result.outcomes.size == 3)
    val f = as[Failed](result.outcomes(0))
    val r = as[Refused](result.outcomes(1))
    val a = as[Applied](result.outcomes(2))
    assert(f.entry.uploadPresentationId == "upload-1")
    assert(r.entry.uploadPresentationId == "upload-2" && r.key == ErrorKey.PageLimit)
    assert(r.discard.toSet == p2.map(_.id).toSet)
    assert(a.entry.uploadPresentationId == "upload-3" && a.target.numPages == 4)
    assert(result.queue.entries.isEmpty)
  }

  it should "Ac-B 20: refuse with targetNotFound the stored Ready of a removed presentation, leaving the others" in {
    val pods = podsWith(presentation(targetId, 3), presentation(otherId, 2))
    val p2 = uuids(1).map(vo(_))
    val q1 = withEntry(InsertPagesQueue.empty, "upload-1", intent(1, 2, target = otherId), Seq(vo(uuid())))
    val q2 = withEntry(q1, "upload-2", intent(1, 2, target = otherId), p2)
    // Enqueued later: its conversion has not passed idleMs at the tick.
    val q = withEntry(q2, "upload-3", intent(1, 3), Seq(vo(uuid())), now = t0 + 2000)
    val s2 = onReady(q, pods, "upload-2", otherId, InsertReady(p2.map(_.id), 100))
    assert(s2.outcomes.isEmpty)
    val removed = s2.pods.removePresentationInPod(podId, otherId)
    val tick = onTick(s2.queue, removed, t0 + 3000, deadlines)
    assert(tick.outcomes.size == 2)
    val t = as[TimedOut](tick.outcomes(0))
    val r = as[Refused](tick.outcomes(1))
    assert(t.entry.uploadPresentationId == "upload-1")
    assert(r.entry.uploadPresentationId == "upload-2" && r.key == ErrorKey.TargetNotFound)
    assert(tick.queue.entries.map(_.uploadPresentationId) == Vector("upload-3"))
  }

  it should "Ac-B 20: apply the Ready of an insert into another presentation while the first is still converting" in {
    val pods = podsWith(presentation(targetId, 3), presentation(otherId, 2))
    val other = uuids(1).map(vo(_))
    val q1 = withEntry(InsertPagesQueue.empty, "upload-1", intent(1, 3), Seq(vo(uuid())))
    val q = withEntry(q1, "upload-2", intent(1, 2, target = otherId), other)
    val result = onReady(q, pods, "upload-2", otherId, InsertReady(other.map(_.id), 100))
    val a = applied(result)
    assert(a.entry.uploadPresentationId == "upload-2" && a.target.id == otherId)
    assert(targetOf(result.pods, otherId).numPages == 3)
    assert(targetOf(result.pods).numPages == 3)
    assert(result.queue.entries.map(_.uploadPresentationId) == Vector("upload-1"))
  }

  it should "Ac-B 20: keep the inserts into one presentation in order while another presentation moves on" in {
    val pods = podsWith(presentation(targetId, 3), presentation(otherId, 2))
    val p2 = uuids(1).map(vo(_))
    val p3 = uuids(1).map(vo(_))
    val q = withEntry(withEntry(
      withEntry(InsertPagesQueue.empty, "upload-1", intent(1, 3), Seq(vo(uuid()))),
      "upload-2", intent(1, 3), p2
    ), "upload-3", intent(1, 2, target = otherId), p3)
    val s2 = onReady(q, pods, "upload-2", targetId, InsertReady(p2.map(_.id), 100))
    assert(s2.outcomes.isEmpty)
    val s3 = onReady(s2.queue, s2.pods, "upload-3", otherId, InsertReady(p3.map(_.id), 100))
    assert(applied(s3).entry.uploadPresentationId == "upload-3")
    assert(s3.queue.entries.map(_.uploadPresentationId) == Vector("upload-1", "upload-2"))
    assert(s3.queue.find("upload-2").get.stage == InsertStage.Ready)
    assert(!targetOf(s3.pods).pages.contains(p2.head.id))

    val failed = onFailed(s3.queue, s3.pods, "upload-1", ErrorKey.Failed, "")
    assert(failed.outcomes.size == 2)
    assert(as[Failed](failed.outcomes(0)).entry.uploadPresentationId == "upload-1")
    assert(as[Applied](failed.outcomes(1)).entry.uploadPresentationId == "upload-2")
    assert(failed.queue.entries.isEmpty)
  }

  it should "Ac-B 20: after a tick, apply the waiting first insert of each presentation, in the order of the requests" in {
    val pods = podsWith(presentation(targetId, 3), presentation(otherId, 2))
    val p3 = uuids(1).map(vo(_))
    val p4 = uuids(1).map(vo(_))
    val q1 = withEntry(InsertPagesQueue.empty, "upload-1", intent(1, 3), Seq(vo(uuid())))
    val q2 = withEntry(q1, "upload-2", intent(1, 2, target = otherId), Seq(vo(uuid())))
    val q3 = withEntry(q2, "upload-3", intent(1, 3), p3)
    val q = withEntry(q3, "upload-4", intent(1, 2, target = otherId), p4)
    val s3 = onReady(q, pods, "upload-3", targetId, InsertReady(p3.map(_.id), 100))
    val s4 = onReady(s3.queue, s3.pods, "upload-4", otherId, InsertReady(p4.map(_.id), 100))
    assert(s3.outcomes.isEmpty && s4.outcomes.isEmpty)
    val tick = onTick(s4.queue, s4.pods, t0 + 3000, deadlines)
    assert(tick.outcomes.size == 4)
    assert(as[TimedOut](tick.outcomes(0)).entry.uploadPresentationId == "upload-1")
    assert(as[TimedOut](tick.outcomes(1)).entry.uploadPresentationId == "upload-2")
    assert(as[Applied](tick.outcomes(2)).entry.uploadPresentationId == "upload-3")
    assert(as[Applied](tick.outcomes(3)).entry.uploadPresentationId == "upload-4")
    assert(targetOf(tick.pods).numPages == 4 && targetOf(tick.pods, otherId).numPages == 3)
    assert(tick.queue.entries.isEmpty)
  }

  it should "Ac-B 20: time out an entry with stored pages, discarding only the ids of no presentation" in {
    val target = presentation(targetId, 3)
    val pods = podsWith(target)
    val fresh = uuids(2)
    val q = withEntry(InsertPagesQueue.empty, "upload-1", intent(1, 3), (fresh :+ idAt(target, 1)).map(vo(_)))
    val result = onTick(q, pods, t0 + 3000, deadlines)
    val timedOut = only[TimedOut](result)
    assert(timedOut.entry.uploadPresentationId == "upload-1")
    assert(timedOut.discard.toSet == fresh.toSet)
    assert(timedOut.discard.size == 2)
    assert(result.queue.entries.isEmpty)
    assert(result.pods == pods)
  }

  // ---------- Ac-B 23 ----------

  behavior of "PresentationInsertPages.referencePage"

  it should "Ac-B 23: take the first page at position 1, the page before in the middle, the last past the end" in {
    val target = presentation(targetId, 4)
    assert(referencePage(target, 1, 4).map(_.num).contains(1))
    assert(referencePage(target, 0, 4).map(_.num).contains(1))
    assert(referencePage(target, 3, 4).map(_.num).contains(2))
    assert(referencePage(target, 5, 4).map(_.num).contains(4))
    assert(referencePage(target, 9, 4).map(_.num).contains(4))
  }

  it should "Ac-B 23: keep the page before a change made after the seen total" in {
    val target = presentation(targetId, 12, orderChanges = List(OrderChange(10, 3, 2)))
    assert(referencePage(target, 3, 10).map(_.id).contains(idAt(target, 2)))
  }

  it should "Ac-B 23: follow the first page moved by a change made after the seen total" in {
    val target = presentation(targetId, 12, orderChanges = List(OrderChange(10, 1, 2)))
    assert(referencePage(target, 1, 10).map(_.id).contains(idAt(target, 3)))
  }

  // ---------- page ids of the recorded insert ----------

  behavior of "PresentationInsertPages.pageIdsInOrder"

  it should "list every page of the target after an insert in the middle, in page order" in {
    val target = presentation(targetId, 3)
    val inserted = Vector(vo(uuid()), vo(uuid()))
    val a = applied(insertOne(podsWith(target), intent(position = 2, seenTotalPages = 3), inserted))
    assert(pageIdsInOrder(a.target) ==
      Vector(idAt(target, 1)) ++ inserted.map(_.id) ++ Vector(idAt(target, 2), idAt(target, 3)))
  }

  it should "list the inserted pages first after an insert at position 1" in {
    val target = presentation(targetId, 2)
    val inserted = Vector(vo(uuid()))
    val a = applied(insertOne(podsWith(target), intent(position = 1, seenTotalPages = 2), inserted))
    assert(pageIdsInOrder(a.target) == inserted.map(_.id) ++ Vector(idAt(target, 1), idAt(target, 2)))
  }
}
