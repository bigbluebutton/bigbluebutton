package org.bigbluebutton.core.running

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.InternalEventBus
import org.bigbluebutton.core.domain.{ MeetingEndReason, MeetingState2x }
import org.bigbluebutton.core.util.TimeUtil

trait MeetingExpiryTrackerHelper extends HandlerHelpers {

  def processMeetingExpiryAudit(
      outGW:       OutMsgRouter,
      eventBus:    InternalEventBus,
      liveMeeting: LiveMeeting,
      state:       MeetingState2x
  ): (MeetingState2x, Option[String]) = {
    val nowInMs = TimeUtil.timeNowInMs()

    val (expired, reason) = state.expiryTracker.hasMeetingExpired(nowInMs)
    if (expired) {
      for {
        expireReason <- reason
      } yield {
        endAllBreakoutRooms(eventBus, liveMeeting, state, expireReason)
        sendEndMeetingDueToExpiry(expireReason, eventBus, outGW, liveMeeting, "system")
      }
    }

    (state, reason)
  }
}
