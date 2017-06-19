package org.bigbluebutton.core2.message.handlers.breakoutrooms

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.messages.MessageTypes
import org.bigbluebutton.common2.messages.Routing
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.common2.messages.breakoutrooms._

trait EndAllBreakoutRoomsMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleEndAllBreakoutRoomsMsg(msg: EndAllBreakoutRoomsMsg): Unit = {

    def broadcastEvent(msg: EndAllBreakoutRoomsMsg): Unit = {

      log.info("EndAllBreakoutRooms event received for meetingId={}", props.meetingProp.intId)

      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(EndBreakoutRoomEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(EndBreakoutRoomEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      BreakoutRooms.getRooms(liveMeeting.breakoutRooms).foreach { room =>
        val body = EndBreakoutRoomEvtMsgBody(room.id)
        val event = EndBreakoutRoomEvtMsg(header, body)
        val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
        outGW.send(msgEvent)
      }
    }

    broadcastEvent(msg)
  }
}
