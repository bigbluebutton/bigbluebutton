package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.BreakoutRoomUsersUpdateInternalMsg
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait BreakoutRoomUsersUpdateMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleBreakoutRoomUsersUpdateInternalMsg(msg: BreakoutRoomUsersUpdateInternalMsg): Unit = {

    def broadcastEvent(msg: BreakoutRoomUsersUpdateInternalMsg): Unit = {
      BreakoutRooms.updateBreakoutUsers(liveMeeting.breakoutRooms, msg.breakoutId, msg.users) foreach { room =>

        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, "not-used")
        val envelope = BbbCoreEnvelope(UpdateBreakoutUsersEvtMsg.NAME, routing)
        val header = BbbClientMsgHeader(UpdateBreakoutUsersEvtMsg.NAME, props.meetingProp.intId, "not-used")

        val body = UpdateBreakoutUsersEvtMsgBody(props.meetingProp.intId, msg.breakoutId, room.users)
        val event = UpdateBreakoutUsersEvtMsg(header, body)
        val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
        outGW.send(msgEvent)
      }
    }

    broadcastEvent(msg)
  }
}
