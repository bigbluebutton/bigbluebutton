package org.bigbluebutton.core2.message.handlers.breakoutrooms

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.messages.MessageTypes
import org.bigbluebutton.common2.messages.Routing
import org.bigbluebutton.common2.messages.breakoutrooms._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.core.running.MeetingActor

trait BreakoutRoomUsersUpdateMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleBreakoutRoomUsersUpdateMsg(msg: BreakoutRoomUsersUpdateMsg): Unit = {

    def broadcastEvent(msg: BreakoutRoomUsersUpdateMsg): Unit = {
      BreakoutRooms.updateBreakoutUsers(liveMeeting.breakoutRooms, msg.body.breakoutMeetingId, msg.body.users) foreach { room =>

        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
        val envelope = BbbCoreEnvelope(UpdateBreakoutUsersEvtMsg.NAME, routing)
        val header = BbbClientMsgHeader(UpdateBreakoutUsersEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

        val body = UpdateBreakoutUsersEvtMsgBody(props.meetingProp.intId, props.recordProp.record, msg.body.breakoutMeetingId, room.users)
        val event = UpdateBreakoutUsersEvtMsg(header, body)
        val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
        outGW.send(msgEvent)
      }
    }

    broadcastEvent(msg)
  }
}
