package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.SendTimeRemainingAuditInternalMsg
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.util.TimeUtil

trait SendBreakoutTimeRemainingMsgHdlr {
  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSendBreakoutTimeRemainingMsg(msg: SendTimeRemainingAuditInternalMsg, state: MeetingState2x): MeetingState2x = {

    for {
      model <- state.breakout
      startedOn <- model.startedOn
    } yield {
      if (!liveMeeting.props.meetingProp.isBreakout) {

        val endMeetingTime = TimeUtil.millisToSeconds(startedOn) + TimeUtil.minutesToSeconds(model.durationInMinutes)
        val timeRemaining = endMeetingTime - TimeUtil.millisToSeconds(System.currentTimeMillis())

        val event = buildBreakoutRoomsTimeRemainingUpdateEvtMsg(liveMeeting.props.meetingProp.intId, timeRemaining.toInt)

        outGW.send(event)
      }
    }

    state
  }

  def buildBreakoutRoomsTimeRemainingUpdateEvtMsg(meetingId: String, timeLeftInSec: Long): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
    val envelope = BbbCoreEnvelope(BreakoutRoomsTimeRemainingUpdateEvtMsg.NAME, routing)
    val body = BreakoutRoomsTimeRemainingUpdateEvtMsgBody(timeLeftInSec)
    val header = BbbClientMsgHeader(BreakoutRoomsTimeRemainingUpdateEvtMsg.NAME, meetingId, "not-used")
    val event = BreakoutRoomsTimeRemainingUpdateEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }
}
