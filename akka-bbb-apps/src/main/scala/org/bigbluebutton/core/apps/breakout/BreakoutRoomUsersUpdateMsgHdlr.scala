package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait BreakoutRoomUsersUpdateMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleBreakoutRoomUsersUpdateMsg(msg: BreakoutRoomUsersUpdateMsg): Unit = {

    def broadcastEvent(msg: BreakoutRoomUsersUpdateMsg): Unit = {
      BreakoutRooms.updateBreakoutUsers(liveMeeting.breakoutRooms, msg.body.breakoutMeetingId, msg.body.users) foreach { room =>

        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
        val envelope = BbbCoreEnvelope(UpdateBreakoutUsersEvtMsg.NAME, routing)
        val header = BbbClientMsgHeader(UpdateBreakoutUsersEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

        val body = UpdateBreakoutUsersEvtMsgBody(props.meetingProp.intId, msg.body.breakoutMeetingId, room.users)
        val event = UpdateBreakoutUsersEvtMsg(header, body)
        val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
        outGW.send(msgEvent)
      }
    }

    broadcastEvent(msg)
  }
}
