package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.EndBreakoutRoomInternalMsg
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait EndAllBreakoutRoomsMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleEndAllBreakoutRoomsMsg(msg: EndAllBreakoutRoomsMsg, state: MeetingState2x): MeetingState2x = {

    for {
      model <- state.breakout
    } yield {
      model.rooms.values.foreach { room =>
        eventBus.publish(BigBlueButtonEvent(room.id, EndBreakoutRoomInternalMsg(props.breakoutProps.parentId, room.id)))
      }
    }

    state.update(None)
  }
}
