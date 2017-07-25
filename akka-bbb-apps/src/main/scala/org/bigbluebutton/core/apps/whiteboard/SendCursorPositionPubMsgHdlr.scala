package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.{ OutMsgRouter }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.MeetingActor

trait SendCursorPositionPubMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleSendCursorPositionPubMsg(msg: SendCursorPositionPubMsg): Unit = {

    def broadcastEvent(msg: SendCursorPositionPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SendCursorPositionEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SendCursorPositionEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = SendCursorPositionEvtMsgBody(msg.body.xPercent, msg.body.yPercent)
      val event = SendCursorPositionEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    broadcastEvent(msg)
  }
}
