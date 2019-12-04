package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait BreakoutRoomsListMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleBreakoutRoomsListMsg(msg: BreakoutRoomsListMsg, state: MeetingState2x): MeetingState2x = {

    def broadcastEvent(rooms: Vector[BreakoutRoomInfo], roomsReady: Boolean): Unit = {
      log.info("Sending breakout rooms list to {} with containing {} room(s)", props.meetingProp.intId, rooms.length)

      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(BreakoutRoomsListEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(BreakoutRoomsListEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = BreakoutRoomsListEvtMsgBody(msg.body.meetingId, rooms, roomsReady)
      val event = BreakoutRoomsListEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      breakoutModel <- state.breakout
    } yield {
      val rooms = breakoutModel.rooms.values.toVector map { r =>
        new BreakoutRoomInfo(r.name, r.externalId, r.id, r.sequence, r.freeJoin)
      }
      val ready = breakoutModel.hasAllStarted()
      broadcastEvent(rooms, ready)
    }

    state
  }
}
