package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.EndBreakoutRoomInternalMsg
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.core.running.MeetingActor

trait EndAllBreakoutRoomsMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleEndAllBreakoutRoomsMsg(msg: EndAllBreakoutRoomsMsg): Unit = {
    BreakoutRooms.getRooms(liveMeeting.breakoutRooms).foreach { room =>
      eventBus.publish(BigBlueButtonEvent(
        room.id,
        EndBreakoutRoomInternalMsg(props.breakoutProps.parentId, room.id)
      ))
    }
  }
}
