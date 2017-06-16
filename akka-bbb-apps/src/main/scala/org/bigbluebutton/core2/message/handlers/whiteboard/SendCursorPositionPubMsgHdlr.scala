package org.bigbluebutton.core2.message.handlers.whiteboard

import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.messages.MessageBody.{ SendCursorPositionEvtMsgBody }
import org.bigbluebutton.common2.messages._

trait SendCursorPositionPubMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleSendCursorPositionPubMsg(msg: SendCursorPositionPubMsg): Unit = {

    def broadcastEvent(msg: SendCursorPositionPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST, props.meetingProp.intId, msg.header.userId)
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