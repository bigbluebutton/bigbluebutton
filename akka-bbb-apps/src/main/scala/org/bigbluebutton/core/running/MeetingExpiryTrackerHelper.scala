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
  ): MeetingState2x = {
    val nowInMs = TimeUtil.timeNowInMs()

    val (expired, reason) = state.expiryTracker.hasMeetingExpired(nowInMs)
    if (expired) {
      for {
        expireReason <- reason
      } yield {
        println("**** Ending meeting for reason " + expireReason)
        sendEndMeetingDueToExpiry(expireReason, eventBus, outGW, liveMeeting)
      }
    }

    state
  }

  def processMeetingInactivityAudit(
    outGW:       OutMsgRouter,
    eventBus:    InternalEventBus,
    liveMeeting: LiveMeeting,
    state:       MeetingState2x
  ): MeetingState2x = {

    val nowInMs = TimeUtil.timeNowInMs()
    if (!state.inactivityTracker.hasRecentActivity(nowInMs)) {
      if (state.inactivityTracker.isMeetingInactive(nowInMs)) {
        println("**** Ending meeting due to inactivity!")
        sendEndMeetingDueToExpiry(MeetingEndReason.ENDED_DUE_TO_INACTIVITY, eventBus, outGW, liveMeeting)
        state
      } else {
        if (!state.inactivityTracker.warningSent) {
          val timeLeftSeconds = TimeUtil.millisToSeconds(state.inactivityTracker.timeLeftInMs(nowInMs))
          val event = buildMeetingInactivityWarningEvtMsg(liveMeeting.props.meetingProp.intId, timeLeftSeconds)
          outGW.send(event)
          val tracker = state.inactivityTracker.setWarningSentAndTimestamp(nowInMs)
          state.update(tracker)
        } else {
          state
        }
      }
    } else {
      state
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
