package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.{ LiveMeeting }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus

trait SendWhiteboardAnnotationPubMsgHdlr {
  this: WhiteboardApp2x =>

  def handle(msg: SendWhiteboardAnnotationPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: SendWhiteboardAnnotationPubMsg, annotation: AnnotationVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SendWhiteboardAnnotationEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SendWhiteboardAnnotationEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SendWhiteboardAnnotationEvtMsgBody(annotation)
      val event = SendWhiteboardAnnotationEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val annotation = sendWhiteboardAnnotation(msg.body.annotation, liveMeeting)
    broadcastEvent(msg, annotation)
  }
}
