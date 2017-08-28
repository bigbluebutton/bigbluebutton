package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait ClientToServerLatencyTracerMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleClientToServerLatencyTracerMsg(msg: ClientToServerLatencyTracerMsg): Unit = {

    def broadcastEvent(): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(ServerToClientLatencyTracerMsg.NAME, routing)
      val header = BbbClientMsgHeader(ServerToClientLatencyTracerMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = ServerToClientLatencyTracerMsgBody(msg.body.timestampUTC, msg.body.rtt, msg.body.senderId)
      val event = ServerToClientLatencyTracerMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    broadcastEvent()
  }
}
