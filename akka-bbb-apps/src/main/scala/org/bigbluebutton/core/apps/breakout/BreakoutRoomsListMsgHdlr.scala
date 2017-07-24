package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait BreakoutRoomsListMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleBreakoutRoomsListMsg(msg: BreakoutRoomsListMsg): Unit = {

    def broadcastEvent(msg: BreakoutRoomsListMsg): Unit = {
      val breakoutRooms = BreakoutRooms.getRooms(liveMeeting.breakoutRooms).toVector map { r => new BreakoutRoomInfo(r.name, r.externalMeetingId, r.id, r.sequence) }
      val roomsReady = liveMeeting.breakoutRooms.pendingRoomsNumber == 0 && breakoutRooms.length > 0

      log.info("Sending breakout rooms list to {} with containing {} room(s)", props.meetingProp.intId, breakoutRooms.length)

      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(BreakoutRoomsListEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(BreakoutRoomsListEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = BreakoutRoomsListEvtMsgBody(msg.body.meetingId, breakoutRooms, roomsReady)
      val event = BreakoutRoomsListEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    broadcastEvent(msg)
  }
}
