package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.api.BreakoutRoomEndedInternalMsg
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait BreakoutRoomEndedInternalMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleBreakoutRoomEndedInternalMsg(msg: BreakoutRoomEndedInternalMsg, state: MeetingState2x): MeetingState2x = {
    log.info("Received breakout room ended. breakoutId={}", msg.meetingId)

    // send out BreakoutRoomEndedEvtMsg to inform clients the breakout has ended
    outGW.send(MsgBuilder.buildBreakoutRoomEndedEvtMsg(liveMeeting.props.meetingProp.intId, "not-used",
      msg.meetingId))

    val updatedModel = for {
      breakoutModel <- state.breakout
    } yield {
      breakoutModel.removeRoom(msg.meetingId)
    }

    updatedModel match {
      case Some(model) =>
        if (model.rooms.isEmpty) {
          // All breakout rooms have ended
          state.update(None)
        } else {
          state.update(Some(model))
        }
      case None =>
        state
    }
  }
}

