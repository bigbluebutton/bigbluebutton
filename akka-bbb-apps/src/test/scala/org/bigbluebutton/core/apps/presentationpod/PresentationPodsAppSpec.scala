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

  private def page(id: String): PresentationPage =
    PresentationPage(id = id, num = 1, urls = Map.empty, content = "")

  private def presentation(id: String, pageIds: String*): PresentationInPod =
    PresentationInPod(
      id = id,
      name = id,
      pages = pageIds.map(p => p -> page(p)).toMap,
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
