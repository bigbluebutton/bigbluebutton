package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.{ EndBreakoutRoomInternalMsg, SendBreakoutTimeRemainingInternalMsg, SendTimeRemainingAuditInternalMsg }
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.domain.{ MeetingEndReason, MeetingState2x }
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.util.TimeUtil

trait SendBreakoutTimeRemainingMsgHdlr {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSendBreakoutTimeRemainingMsg(msg: SendTimeRemainingAuditInternalMsg, state: MeetingState2x): MeetingState2x = {
    for {
      model <- state.breakout
      startedOn <- model.startedOn
    } yield {
      val endMeetingTime = TimeUtil.millisToSeconds(startedOn) + model.durationInSeconds
      val timeRemaining = endMeetingTime - TimeUtil.millisToSeconds(System.currentTimeMillis())

      if (!liveMeeting.props.meetingProp.isBreakout) {
        // Notify parent meeting users of breakout rooms time remaining
        val event = buildBreakoutRoomsTimeRemainingUpdateEvtMsg(liveMeeting.props.meetingProp.intId, timeRemaining.toInt, 0)
        outGW.send(event)
      }

      // Tell all breakout rooms of time remaining so they can notify their users.
      // This syncs all rooms about time remaining.
      model.rooms.values.foreach { room =>
        eventBus.publish(BigBlueButtonEvent(room.id, SendBreakoutTimeRemainingInternalMsg(props.breakoutProps.parentId, timeRemaining.toInt, msg.timeUpdatedInMinutes)))
      }

      if (timeRemaining < 0) {
        endAllBreakoutRooms(eventBus, liveMeeting, state, MeetingEndReason.BREAKOUT_ENDED_EXCEEDING_DURATION)
      }
    }

    state
  }

  def buildBreakoutRoomsTimeRemainingUpdateEvtMsg(meetingId: String, timeLeftInSec: Long, timeUpdatedInMinutes: Int = 0): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
    val envelope = BbbCoreEnvelope(BreakoutRoomsTimeRemainingUpdateEvtMsg.NAME, routing)
    val body = BreakoutRoomsTimeRemainingUpdateEvtMsgBody(timeLeftInSec)
    val header = BbbClientMsgHeader(BreakoutRoomsTimeRemainingUpdateEvtMsg.NAME, meetingId, "not-used")
    val event = BreakoutRoomsTimeRemainingUpdateEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }
}
