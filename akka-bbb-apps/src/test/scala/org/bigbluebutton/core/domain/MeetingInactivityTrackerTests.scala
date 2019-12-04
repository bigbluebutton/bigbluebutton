package org.bigbluebutton.core.domain

import org.bigbluebutton.core.UnitSpec
import org.bigbluebutton.core.util.TimeUtil

class MeetingInactivityTrackerTests extends UnitSpec {

  "A MeetingInactivityTrackerHelper" should "be return meeting is inactive" in {
    val nowInMinutes = TimeUtil.minutesToSeconds(15)

    val inactivityTracker = new MeetingInactivityTracker(
      maxInactivityTimeoutInMs = 12,
      warningBeforeMaxInMs = 2,
      lastActivityTimestampInMs = TimeUtil.minutesToSeconds(5),
      warningSent = true,
      warningSentOnTimestampInMs = 0L
    )

    val active = inactivityTracker.isMeetingInactive(nowInMinutes)
    assert(active == true)
  }

  "A MeetingInactivityTrackerHelper" should "be return meeting is active" in {
    val nowInMinutes = TimeUtil.minutesToSeconds(18)
    val inactivityTracker = new MeetingInactivityTracker(
      maxInactivityTimeoutInMs = 12,
      warningBeforeMaxInMs = 2,
      lastActivityTimestampInMs = TimeUtil.minutesToSeconds(5),
      warningSent = true,
      warningSentOnTimestampInMs = 0L
    )

    val inactive = inactivityTracker.isMeetingInactive(nowInMinutes)
    assert(inactive)
  }

}
