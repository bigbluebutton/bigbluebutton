package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.core.domain.{ MeetingExpiryTracker, MeetingRecordingTracker, MeetingState2x }
import org.bigbluebutton.core.models._
import org.scalatest.flatspec.AnyFlatSpec

// Exercises the page-ownership check that scopes presentation page and whiteboard
// annotation writes to the meeting that owns the page.
//
// NOTE: extends AnyFlatSpec directly rather than the shared UnitSpec, which
// currently does not compile against the resolved ScalaTest 3.2.x (UnitSpec
// still imports the pre-3.2 org.scalatest.FlatSpec / Matchers packages). The
// state below is hand-built for the same reason: AppsTestFixtures does not
// compile either. pageBelongsToMeeting reads only presentationPodManager, so
// the remaining MeetingState2x fields are inert placeholders.
class PresentationPodsAppSpec extends AnyFlatSpec {

  private def page(id: String, num: Int): PresentationPage =
    PresentationPage(id = id, num = num, urls = Map.empty, content = "")

  // Pages get the positions 1..n in the order given.
  private def presentation(id: String, pageIds: String*): PresentationInPod =
    PresentationInPod(
      id = id,
      name = id,
      pages = pageIds.zipWithIndex.map { case (p, i) => p -> page(p, i + 1) }.toMap,
      downloadable = false,
      removable = true,
      uploadCompleted = true,
      numPages = pageIds.size,
      errorDetails = Map.empty
    )

  private def stateWith(pods: PresentationPod*): MeetingState2x =
    MeetingState2x(
      groupChats = GroupChats(Map.empty),
      presentationPodManager = PresentationPodManager(pods.map(p => p.id -> p).toMap),
      breakout = None,
      lastBreakout = None,
      expiryTracker = MeetingExpiryTracker(
        startedOnInMs = 0L,
        userHasJoined = false,
        moderatorHasJoined = false,
        isBreakout = false,
        lastUserLeftOnInMs = None,
        lastModeratorLeftOnInMs = 0L,
        durationInMs = 0L,
        meetingExpireIfNoUserJoinedInMs = 0L,
        meetingExpireWhenLastUserLeftInMs = 0L,
        userInactivityInspectTimerInMs = 0L,
        userInactivityThresholdInMs = 0L,
        userActivitySignResponseDelayInMs = 0L,
        endWhenNoModerator = false,
        endWhenNoModeratorDelayInMs = 0L
      ),
      recordingTracker = MeetingRecordingTracker(0L, 0L),
      mediaGroups = MediaGroups(Map.empty),
      presentationConversions = PresentationConversions(Map.empty)
    )

  private val ownPageId = "own-presentation-id/1"
  private val foreignPageId = "foreign-presentation-id/1"

  private val defaultPod =
    PresentationPod(PresentationPod.DEFAULT_PRESENTATION_POD, "", Map.empty)
      .addPresentation(presentation("own-presentation-id", ownPageId, "own-presentation-id/2"))

  behavior of "PresentationPodsApp.pageBelongsToMeeting"

  it should "accept a page held by one of the meeting's presentation pods" in {
    assert(PresentationPodsApp.pageBelongsToMeeting(stateWith(defaultPod), ownPageId))
    assert(PresentationPodsApp.pageBelongsToMeeting(stateWith(defaultPod), "own-presentation-id/2"))
  }

  it should "reject a page belonging to another meeting" in {
    assert(!PresentationPodsApp.pageBelongsToMeeting(stateWith(defaultPod), foreignPageId))
  }

  it should "reject a page id that does not exist at all" in {
    assert(!PresentationPodsApp.pageBelongsToMeeting(stateWith(defaultPod), "no-such-page"))
  }

  it should "reject the deskshare pseudo page, which is not a presentation page" in {
    // Poll results published over screenshare use this id, and they reach
    // WhiteboardModel directly rather than through the gated handlers.
    assert(!PresentationPodsApp.pageBelongsToMeeting(stateWith(defaultPod), "deskshare"))
  }

  it should "reject every page when the meeting has no pods or no presentations" in {
    val emptyPod = PresentationPod(PresentationPod.DEFAULT_PRESENTATION_POD, "", Map.empty)
    assert(!PresentationPodsApp.pageBelongsToMeeting(stateWith(), ownPageId))
    assert(!PresentationPodsApp.pageBelongsToMeeting(stateWith(emptyPod), ownPageId))
  }

  behavior of "PresentationPodsApp.pageBelongsToMeeting (multi-pod)"

  it should "find a page held by a non-default pod" in {
    val secondPod = PresentationPod("second-pod", "", Map.empty)
      .addPresentation(presentation("second-presentation-id", "second-presentation-id/1"))
    val state = stateWith(defaultPod, secondPod)

    assert(PresentationPodsApp.pageBelongsToMeeting(state, "second-presentation-id/1"))
    assert(PresentationPodsApp.pageBelongsToMeeting(state, ownPageId))
  }

  behavior of "PresentationPodsApp.findPodWithPresentation"

  it should "return the pod that holds the presentation" in {
    val secondPod = PresentationPod("second-pod", "", Map.empty)
      .addPresentation(presentation("second-presentation-id", "second-presentation-id/1"))
    val state = stateWith(defaultPod, secondPod)

    assert(PresentationPodsApp.findPodWithPresentation(state, "own-presentation-id").map(_.id)
      .contains(PresentationPod.DEFAULT_PRESENTATION_POD))
    assert(PresentationPodsApp.findPodWithPresentation(state, "second-presentation-id").map(_.id)
      .contains("second-pod"))
  }

  it should "return None for a presentation held by no pod" in {
    assert(PresentationPodsApp.findPodWithPresentation(stateWith(defaultPod), "no-such-presentation").isEmpty)
    assert(PresentationPodsApp.findPodWithPresentation(stateWith(), "own-presentation-id").isEmpty)
  }

  behavior of "PresentationPodsApp.podIsFullFor"

  it should "refuse a new presentation when the pod is at its limit" in {
    assert(PresentationPodsApp.podIsFullFor(defaultPod, "new-presentation-id", 1))
  }

  it should "not refuse a presentation the full pod already holds" in {
    assert(!PresentationPodsApp.podIsFullFor(defaultPod, "own-presentation-id", 1))
  }

  it should "accept a new presentation while the pod is below its limit" in {
    assert(!PresentationPodsApp.podIsFullFor(defaultPod, "new-presentation-id", 2))
  }

  it should "never refuse when the limit is disabled" in {
    assert(!PresentationPodsApp.podIsFullFor(defaultPod, "new-presentation-id", 0))
  }

  behavior of "PresentationPodsApp.maxPresentationsPerPodFor"

  it should "let server imports go past the cap, up to twice it" in {
    assert(PresentationPodsApp.maxPresentationsPerPodFor(systemUpload = true, 50) == 100)
    assert(PresentationPodsApp.maxPresentationsPerPodFor(systemUpload = false, 50) == 50)
  }

  it should "keep the cap disabled for server imports" in {
    assert(PresentationPodsApp.maxPresentationsPerPodFor(systemUpload = true, 0) == 0)
  }

  behavior of "PresentationPodsApp.findPresentationPage"

  it should "return the page and its presentation" in {
    val found = PresentationPodsApp.findPresentationPage(stateWith(defaultPod), "own-presentation-id/2")
    assert(found.map { case (pres, page) => (pres.id, page.id, page.num) }
      .contains(("own-presentation-id", "own-presentation-id/2", 2)))
  }

  it should "find a page held by a non-default pod" in {
    val secondPod = PresentationPod("second-pod", "", Map.empty)
      .addPresentation(presentation("second-presentation-id", "p-a", "p-b"))
    val found = PresentationPodsApp.findPresentationPage(stateWith(defaultPod, secondPod), "p-b")
    assert(found.map { case (pres, page) => (pres.id, page.num) }.contains(("second-presentation-id", 2)))
  }

  it should "return None for an id that is not a page of the meeting" in {
    assert(PresentationPodsApp.findPresentationPage(stateWith(defaultPod), foreignPageId).isEmpty)
    assert(PresentationPodsApp.findPresentationPage(stateWith(defaultPod), "deskshare").isEmpty)
  }

  behavior of "PresentationPodsApp.pageRefsFor"

  it should "give the presentation and position of each page" in {
    val refs = PresentationPodsApp.pageRefsFor(stateWith(defaultPod), Seq(ownPageId, "own-presentation-id/2"))
    assert(refs == Map(
      ownPageId -> org.bigbluebutton.common2.msgs.PageRef("own-presentation-id", 1),
      "own-presentation-id/2" -> org.bigbluebutton.common2.msgs.PageRef("own-presentation-id", 2)
    ))
  }

  it should "leave out an id that does not resolve and a page of another meeting" in {
    val refs = PresentationPodsApp.pageRefsFor(stateWith(defaultPod), Seq(ownPageId, "deskshare", foreignPageId))
    assert(refs.keySet == Set(ownPageId))
  }

  it should "list a repeated id once" in {
    assert(PresentationPodsApp.pageRefsFor(stateWith(defaultPod), Seq(ownPageId, ownPageId)).size == 1)
  }

  behavior of "PresentationInPod.pageByNum"

  it should "find the page at a position" in {
    val pres = presentation("p", "id-a", "id-b", "id-c")
    assert(PresentationInPod.pageByNum(pres, 2).map(_.id).contains("id-b"))
    assert(PresentationInPod.pageByNum(pres, 3).map(_.id).contains("id-c"))
  }

  it should "find nothing at a position the presentation does not have" in {
    val pres = presentation("p", "id-a", "id-b")
    assert(PresentationInPod.pageByNum(pres, 0).isEmpty)
    assert(PresentationInPod.pageByNum(pres, 3).isEmpty)
  }

  behavior of "PresentationPod.resizePage"

  it should "change the zoom of the page and keep its position" in {
    val resized = defaultPod.resizePage("own-presentation-id", "own-presentation-id/2", 10, 20, 50, 60)
    resized match {
      case Some((pod, page)) =>
        assert(page.num == 2)
        assert((page.xOffset, page.yOffset, page.widthRatio, page.heightRatio) == (10.0, 20.0, 50.0, 60.0))
        assert(pod.getPresentation("own-presentation-id").flatMap(_.pages.get("own-presentation-id/2")).map(_.num).contains(2))
      case None => fail("page not resized")
    }
  }

  behavior of "PresentationPodsApp.isPresentationId"

  it should "accept the ids generatePresentationId produces" in {
    assert(PresentationPodsApp.isPresentationId(PresentationPodsApp.generatePresentationId("slides.pdf")))
    assert(PresentationPodsApp.isPresentationId("0123456789abcdef0123456789abcdef01234567-1793037924284"))
  }

  it should "reject anything else" in {
    val digest = "0123456789abcdef0123456789abcdef01234567"
    assert(!PresentationPodsApp.isPresentationId(""))
    assert(!PresentationPodsApp.isPresentationId("not-a-presentation-id"))
    assert(!PresentationPodsApp.isPresentationId(digest))
    assert(!PresentationPodsApp.isPresentationId(digest + "-"))
    assert(!PresentationPodsApp.isPresentationId(digest.dropRight(1) + "-1793037924284"))
    assert(!PresentationPodsApp.isPresentationId(digest + "8-1793037924284"))
    assert(!PresentationPodsApp.isPresentationId(digest.toUpperCase + "-1793037924284"))
    assert(!PresentationPodsApp.isPresentationId(digest + "-1793037924284x"))
  }
}
