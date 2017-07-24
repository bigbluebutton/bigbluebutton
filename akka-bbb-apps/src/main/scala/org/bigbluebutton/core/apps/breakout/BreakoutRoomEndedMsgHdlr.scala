package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait BreakoutRoomEndedMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleBreakoutRoomEndedMsg(msg: BreakoutRoomEndedMsg): Unit = {

    // send out BreakoutRoomEndedEvtMsg to inform clients the breakout has ended
    outGW.send(MsgBuilder.buildBreakoutRoomEndedEvtMsg(liveMeeting.props.meetingProp.intId, msg.header.userId,
      msg.body.breakoutRoomId))

    BreakoutRooms.removeRoom(liveMeeting.breakoutRooms, msg.body.breakoutRoomId)
  }
}
