package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.api.{ ExtendBreakoutRoomTimeInternalMsg }
import org.bigbluebutton.core.domain.{ MeetingState2x }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait ExtendBreakoutRoomTimeInternalMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleExtendBreakoutRoomTimeInternalMsgHdlr(msg: ExtendBreakoutRoomTimeInternalMsg, state: MeetingState2x): MeetingState2x = {

    val breakoutModel = for {
      model <- state.breakout
    } yield {
      val updatedBreakoutModel = model.extendTime(msg.extendTimeInMinutes)
      updatedBreakoutModel
    }

    breakoutModel match {
      case Some(model) => state.update(Some(model))
      case None        => state
    }

  }
}
