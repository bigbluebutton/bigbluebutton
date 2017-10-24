package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting

trait GetWhiteboardAnnotationsReqMsgHdlr {
  this: WhiteboardApp2x =>

  def handle(msg: GetWhiteboardAnnotationsReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: GetWhiteboardAnnotationsReqMsg, history: Array[AnnotationVO]): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(GetWhiteboardAnnotationsRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetWhiteboardAnnotationsRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = GetWhiteboardAnnotationsRespMsgBody(msg.body.whiteboardId, history)
      val event = GetWhiteboardAnnotationsRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val history = getWhiteboardAnnotations(msg.body.whiteboardId, liveMeeting)
    broadcastEvent(msg, history)
  }
}
