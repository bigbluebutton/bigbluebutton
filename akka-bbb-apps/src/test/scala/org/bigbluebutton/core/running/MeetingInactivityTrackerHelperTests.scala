package org.bigbluebutton.core.running

import org.bigbluebutton.core.UnitSpec
import org.bigbluebutton.core.domain.MeetingInactivityTracker

class MeetingInactivityTrackerHelperTests extends UnitSpec {

  "A MeetingInactivityTrackerHelper" should "be return meeting is inactive" in {
    val nowInMinutes = 25
    val lastActivityTimeInMinutes = 10
    val maxInactivityTimeoutMinutes = 12
    val active = MeetingInactivityTrackerHelper.isMeetingActive(
      nowInMinutes,
      lastActivityTimeInMinutes,
      maxInactivityTimeoutMinutes
    )
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
