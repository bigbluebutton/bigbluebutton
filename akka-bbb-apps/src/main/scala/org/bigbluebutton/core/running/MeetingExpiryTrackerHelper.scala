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
        endAllBreakoutRooms(eventBus, liveMeeting, state)
        sendEndMeetingDueToExpiry(expireReason, eventBus, outGW, liveMeeting)
      }
    }

    (state, reason)
  }

  def processMeetingInactivityAudit(
    outGW:       OutMsgRouter,
    eventBus:    InternalEventBus,
    liveMeeting: LiveMeeting,
    state:       MeetingState2x
  ): (MeetingState2x, Option[String]) = {

    val nowInMs = TimeUtil.timeNowInMs()
    if (!state.inactivityTracker.hasRecentActivity(nowInMs)) {
      if (state.inactivityTracker.isMeetingInactive(nowInMs)) {
        val expireReason = MeetingEndReason.ENDED_DUE_TO_INACTIVITY
        endAllBreakoutRooms(eventBus, liveMeeting, state)
        sendEndMeetingDueToExpiry(expireReason, eventBus, outGW, liveMeeting)
        (state, Some(expireReason))
      } else {
        if (!state.inactivityTracker.warningSent) {
          println("*********** SENDING INACTIVITY WARNING ******************")
          val timeLeftSeconds = TimeUtil.millisToSeconds(state.inactivityTracker.timeLeftInMs(nowInMs))
          val event = buildMeetingInactivityWarningEvtMsg(liveMeeting.props.meetingProp.intId, timeLeftSeconds)
          outGW.send(event)
          val tracker = state.inactivityTracker.setWarningSentAndTimestamp(nowInMs)
          (state.update(tracker), None)
        } else {
          (state, None)
        }
      }
    } else {
      println("**************** MEETING HAS ACTIVITY *************")
      (state, None)
    }
  }

  def buildMeetingInactivityWarningEvtMsg(meetingId: String, timeLeftInSec: Long): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
    val envelope = BbbCoreEnvelope(MeetingInactivityWarningEvtMsg.NAME, routing)
    val body = MeetingInactivityWarningEvtMsgBody(timeLeftInSec)
    val header = BbbClientMsgHeader(MeetingInactivityWarningEvtMsg.NAME, meetingId, "not-used")
    val event = MeetingInactivityWarningEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }
}
