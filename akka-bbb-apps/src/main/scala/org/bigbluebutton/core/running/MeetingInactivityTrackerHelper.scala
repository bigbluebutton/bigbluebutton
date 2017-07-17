package org.bigbluebutton.core.running

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.domain.{ MeetingInactivityTracker, MeetingState2x }
import com.softwaremill.quicklens._
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.bus.IncomingEventBus
import org.bigbluebutton.core.util.TimeUtil

class MeetingInactivityTrackerHelper(
    val liveMeeting: LiveMeeting,
    val outGW:       OutMessageGateway
)(implicit val context: ActorContext) extends HandlerHelpers {

  val log = Logging(context.system, getClass)

  def processMeetingInactivityAudit(
    props:    DefaultProps,
    outGW:    OutMessageGateway,
    eventBus: IncomingEventBus,
    state:    MeetingState2x
  ): MeetingState2x = {

    val nowInSeconds = TimeUtil.timeNowInSeconds()
    if (!MeetingInactivityTracker.hasRecentActivity(state, nowInSeconds)) {
      if (MeetingInactivityTracker.isMeetingInactive(state, nowInSeconds)) {
        sendEndMeetingDueToInactivity(props, eventBus)
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

  def sendEndMeetingDueToInactivity(props: DefaultProps, eventBus: IncomingEventBus): Unit = {
    endMeeting(outGW, liveMeeting)

    if (liveMeeting.props.meetingProp.isBreakout) {
      log.info(
        "Informing parent meeting {} that a breakout room has been ended {}",
        liveMeeting.props.breakoutProps.parentId, liveMeeting.props.meetingProp.intId
      )
      notifyParentThatBreakoutEnded(eventBus, liveMeeting)
    }

    destroyMeeting(eventBus, liveMeeting.props.meetingProp.intId)
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

  def processMeetingActivityResponse(
    props: DefaultProps,
    outGW: OutMessageGateway,
    msg:   MeetingActivityResponseCmdMsg
  ): Unit = {

    def buildMeetingIsActiveEvtMsg(meetingId: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
      val envelope = BbbCoreEnvelope(MeetingIsActiveEvtMsg.NAME, routing)
      val body = MeetingIsActiveEvtMsgBody(meetingId)
      val header = BbbClientMsgHeader(MeetingIsActiveEvtMsg.NAME, meetingId, "not-used")
      val event = MeetingIsActiveEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val event = buildMeetingIsActiveEvtMsg(props.meetingProp.intId)
    outGW.send(event)

  }
}
