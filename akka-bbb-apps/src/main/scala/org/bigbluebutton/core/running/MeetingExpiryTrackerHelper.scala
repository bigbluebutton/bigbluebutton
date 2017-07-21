package org.bigbluebutton.core.running

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.bus.IncomingEventBus
import org.bigbluebutton.core.domain.{ MeetingEndReason, MeetingExpiryTracker, MeetingInactivityTracker, MeetingState2x }
import org.bigbluebutton.core.util.TimeUtil

class MeetingExpiryTrackerHelper(
    val liveMeeting: LiveMeeting,
    val outGW:       OutMessageGateway,
    val eventBus:    IncomingEventBus
)(implicit val context: ActorContext) extends HandlerHelpers {

  val log = Logging(context.system, getClass)

  def processMeetingExpiryAudit(state: MeetingState2x): MeetingState2x = {
    val nowInSeconds = TimeUtil.timeNowInSeconds()

    val (expired, reason) = MeetingExpiryTracker.hasMeetingExpired(state, nowInSeconds)
    if (expired) {
      for {
        expireReason <- reason
      } yield {
        sendEndMeetingDueToExpiry(expireReason, eventBus, outGW, liveMeeting)
      }
    }

    state
  }

  def processMeetingInactivityAudit(state: MeetingState2x): MeetingState2x = {

    val nowInSeconds = TimeUtil.timeNowInSeconds()
    if (!MeetingInactivityTracker.hasRecentActivity(state, nowInSeconds)) {
      if (MeetingInactivityTracker.isMeetingInactive(state, nowInSeconds)) {
        sendEndMeetingDueToExpiry(MeetingEndReason.ENDED_DUE_TO_INACTIVITY, eventBus, outGW, liveMeeting)
        state
      } else {
        if (!MeetingInactivityTracker.warningHasBeenSent(state)) {
          warnOfMeetingInactivity(nowInSeconds, state)
          MeetingInactivityTracker.setWarningSentAndTimestamp(state, nowInSeconds)
        } else {
          state
        }
      }
    } else {
      state
    }
  }

  def warnOfMeetingInactivity(nowInSeconds: Long, state: MeetingState2x): Unit = {
    val timeLeftSeconds = MeetingInactivityTracker.timeLeftInSeconds(state, nowInSeconds)
    val event = buildMeetingInactivityWarningEvtMsg(liveMeeting.props.meetingProp.intId, timeLeftSeconds)
    outGW.send(event)
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
