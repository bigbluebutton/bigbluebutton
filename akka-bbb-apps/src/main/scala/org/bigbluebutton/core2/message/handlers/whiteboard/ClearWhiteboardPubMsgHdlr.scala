package org.bigbluebutton.core2.message.handlers.whiteboard

import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.messages.MessageBody.{ ClearWhiteboardEvtMsgBody }
import org.bigbluebutton.common2.messages._

trait ClearWhiteboardPubMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleClearWhiteboardPubMsg(msg: ClearWhiteboardPubMsg): Unit = {

    def broadcastEvent(msg: ClearWhiteboardPubMsg, fullClear: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(ClearWhiteboardEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ClearWhiteboardEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = ClearWhiteboardEvtMsgBody(msg.body.whiteboardId, msg.header.userId, fullClear)
      val event = ClearWhiteboardEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    for {
      fullClear <- clearWhiteboard(msg.body.whiteboardId, msg.header.userId)
    } yield {
      broadcastEvent(msg, fullClear)
    }
  }
}