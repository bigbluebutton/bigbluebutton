package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.MeetingActor

trait SendWhiteboardAnnotationPubMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleSendWhiteboardAnnotationPubMsg(msg: SendWhiteboardAnnotationPubMsg): Unit = {

    def broadcastEvent(msg: SendWhiteboardAnnotationPubMsg, annotation: AnnotationVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SendWhiteboardAnnotationEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SendWhiteboardAnnotationEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = SendWhiteboardAnnotationEvtMsgBody(annotation)
      val event = SendWhiteboardAnnotationEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      record(event)
    }

    val annotation = sendWhiteboardAnnotation(msg.body.annotation)
    broadcastEvent(msg, annotation)
  }
}
