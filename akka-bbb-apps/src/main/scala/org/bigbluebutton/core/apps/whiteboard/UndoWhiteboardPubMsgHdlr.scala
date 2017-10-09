package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.{ LiveMeeting }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus

trait UndoWhiteboardPubMsgHdlr {
  this: WhiteboardApp2x =>

  def handle(msg: UndoWhiteboardPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: UndoWhiteboardPubMsg, removedAnnotationId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(UndoWhiteboardEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UndoWhiteboardEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = UndoWhiteboardEvtMsgBody(msg.body.whiteboardId, msg.header.userId, removedAnnotationId)
      val event = UndoWhiteboardEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    for {
      lastAnnotation <- undoWhiteboard(msg.body.whiteboardId, msg.header.userId, liveMeeting)
    } yield {
      broadcastEvent(msg, lastAnnotation.id)
    }
  }
}
