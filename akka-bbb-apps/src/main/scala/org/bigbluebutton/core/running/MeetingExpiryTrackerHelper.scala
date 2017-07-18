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
    val outGW:       OutMessageGateway
)(implicit val context: ActorContext) extends HandlerHelpers {

  val log = Logging(context.system, getClass)

  def processMeetingExpiryAudit(props: DefaultProps, state: MeetingState2x, eventBus: IncomingEventBus): MeetingState2x = {
    val nowInSeconds = TimeUtil.timeNowInSeconds()

    if (MeetingExpiryTracker.hasMeetingExpiredNeverBeenJoined(state, nowInSeconds)) {
      sendEndMeetingDueToExpiry(MeetingEndReason.ENDED_WHEN_NOT_JOINED, eventBus, outGW, liveMeeting)
    } else if (MeetingExpiryTracker.meetingOverDuration(state, nowInSeconds)) {
      sendEndMeetingDueToExpiry(MeetingEndReason.ENDED_AFTER_EXCEEDING_DURATION, eventBus, outGW, liveMeeting)
    } else if (MeetingExpiryTracker.hasMeetingExpiredAfterLastUserLeft(state, nowInSeconds)) {
      sendEndMeetingDueToExpiry(MeetingEndReason.ENDED_WHEN_LAST_USER_LEFT, eventBus, outGW, liveMeeting)
    }

    state
  }

  def processMeetingInactivityAudit(
    props:    DefaultProps,
    outGW:    OutMessageGateway,
    eventBus: IncomingEventBus,
    state:    MeetingState2x
  ): MeetingState2x = {

    val nowInSeconds = TimeUtil.timeNowInSeconds()
    if (!MeetingInactivityTracker.hasRecentActivity(state, nowInSeconds)) {
      if (MeetingInactivityTracker.isMeetingInactive(state, nowInSeconds)) {
        sendEndMeetingDueToExpiry(MeetingEndReason.ENDED_DUE_TO_INACTIVITY, eventBus, outGW, liveMeeting)
        state
      } else {
        if (!MeetingInactivityTracker.warningHasBeenSent(state)) {
          warnOfMeetingInactivity(props, outGW, nowInSeconds, state)
          MeetingInactivityTracker.setWarningSentAndTimestamp(state, nowInSeconds)
        } else {
          state
        }
      }
    } else {
      state
    }
  }

  def warnOfMeetingInactivity(props: DefaultProps, outGW: OutMessageGateway,
                              nowInSeconds: Long, state: MeetingState2x): Unit = {
    val timeLeftSeconds = MeetingInactivityTracker.timeLeftInSeconds(state, nowInSeconds)
    sendMeetingInactivityWarning(props, outGW, timeLeftSeconds)
  }

  def sendMeetingInactivityWarning(props: DefaultProps, outGW: OutMessageGateway, timeLeftSeconds: Long): Unit = {
    def build(meetingId: String, timeLeftInSec: Long): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
      val envelope = BbbCoreEnvelope(MeetingInactivityWarningEvtMsg.NAME, routing)
      val body = MeetingInactivityWarningEvtMsgBody(timeLeftInSec)
      val header = BbbClientMsgHeader(MeetingInactivityWarningEvtMsg.NAME, meetingId, "not-used")
      val event = MeetingInactivityWarningEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val event = build(props.meetingProp.intId, timeLeftSeconds)
    outGW.send(event)
  }

}
