package org.bigbluebutton.core2.message.handlers.whiteboard

import org.bigbluebutton.common2.messages.Whiteboard.{ UndoWhiteboardEvtMsg, UndoWhiteboardEvtMsgBody, UndoWhiteboardPubMsg }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.messages._

trait UndoWhiteboardPubMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUndoWhiteboardPubMsg(msg: UndoWhiteboardPubMsg): Unit = {

    def broadcastEvent(msg: UndoWhiteboardPubMsg, removedAnnotationId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(UndoWhiteboardEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UndoWhiteboardEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = UndoWhiteboardEvtMsgBody(msg.body.whiteboardId, msg.header.userId, removedAnnotationId)
      val event = UndoWhiteboardEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    for {
      lastAnnotation <- undoWhiteboard(msg.body.whiteboardId, msg.header.userId)
    } yield {
      broadcastEvent(msg, lastAnnotation.id)
    }
  }
}
