package org.bigbluebutton.core.domain

import org.bigbluebutton.core.UnitSpec
import org.bigbluebutton.core.running.MeetingExpiryTrackerHelper
import org.bigbluebutton.core.util.TimeUtil

class MeetingInactivityTrackerTests extends UnitSpec {

  "A MeetingInactivityTrackerHelper" should "be return meeting is inactive" in {
    val nowInMinutes = 25
    val lastActivityTimeInMinutes = 10
    val maxInactivityTimeoutMinutes = 12

    val inactivityTracker = new MeetingInactivityTracker(
      12,
      2,
      lastActivityTimestamp = 11,
      warningSent = false,
      warningSentOnTimestamp = 0L
    )

    val active = MeetingInactivityTracker.setWarningSentAndTimestamp()
    assert(active == false)
  }

  "A MeetingInactivityTrackerHelper" should "be return meeting is active" in {
    val warningSent = true
    val nowInMinutes = 25
    val lastActivityTimeInMinutes = 10
    val maxInactivityTimeoutMinutes = 12
    val active = MeetingInactivityTrackerHelper.isMeetingInactive(
      warningSent,
      nowInMinutes, lastActivityTimeInMinutes, maxInactivityTimeoutMinutes
    )
    assert(active)
  }

}
