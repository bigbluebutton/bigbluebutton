package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.{ OutMsgRouter }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.MeetingActor

trait GetWhiteboardAnnotationsReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetWhiteboardAnnotationsReqMsg(msg: GetWhiteboardAnnotationsReqMsg): Unit = {

    def broadcastEvent(msg: GetWhiteboardAnnotationsReqMsg, history: Array[AnnotationVO]): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(GetWhiteboardAnnotationsRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetWhiteboardAnnotationsRespMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = GetWhiteboardAnnotationsRespMsgBody(msg.body.whiteboardId, history)
      val event = GetWhiteboardAnnotationsRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    val history = getWhiteboardAnnotations(msg.body.whiteboardId)
    broadcastEvent(msg, history)
  }
}
