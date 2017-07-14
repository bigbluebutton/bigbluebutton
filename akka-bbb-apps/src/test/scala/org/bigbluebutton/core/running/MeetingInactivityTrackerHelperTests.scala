package org.bigbluebutton.core.running

import org.bigbluebutton.core.UnitSpec
import org.bigbluebutton.core.domain.MeetingInactivityTracker

class MeetingInactivityTrackerHelperTests extends UnitSpec {

  "A MeetingInactivityTrackerHelper" should "be return meeting is inactive" in {
    object Handler extends MeetingInactivityTrackerHelper

    val tracker = new MeetingInactivityTracker(20, 5, 10, false, 0L)
    val active = Handler.isMeetingActive(40, tracker)
    assert(active == false)
  }

  "A MeetingInactivityTrackerHelper" should "be return meeting is active" in {
    object Handler extends MeetingInactivityTrackerHelper

    val tracker = new MeetingInactivityTracker(20, 5, 10, false, 0L)
    val active = Handler.isMeetingActive(12, tracker)
    assert(active)
  }

  "A MeetingInactivityTrackerHelper" should "be return send warning if close to max inactivity" in {
    object Handler extends MeetingInactivityTrackerHelper

    val tracker = new MeetingInactivityTracker(20, 5, 10, false, 0L)

    val send = Handler.shouldSendInactivityWarning(now = 28, tracker)
    assert(send)
  }

}
