package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.api.BreakoutRoomEndedInternalMsg
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait BreakoutRoomEndedInternalMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleBreakoutRoomEndedInternalMsg(msg: BreakoutRoomEndedInternalMsg): Unit = {
    // send out BreakoutRoomEndedEvtMsg to inform clients the breakout has ended
    outGW.send(MsgBuilder.buildBreakoutRoomEndedEvtMsg(liveMeeting.props.meetingProp.intId, "not-used",
      msg.meetingId))

    BreakoutRooms.removeRoom(liveMeeting.breakoutRooms, msg.meetingId)
  }
}

