package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.{ LiveMeeting }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus

trait GetWhiteboardAccessReqMsgHdlr {
  this: WhiteboardApp2x =>

  def handle(msg: GetWhiteboardAccessReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: GetWhiteboardAccessReqMsg, multiUser: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(GetWhiteboardAccessRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetWhiteboardAccessRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = GetWhiteboardAccessRespMsgBody(multiUser)
      val event = GetWhiteboardAccessRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    broadcastEvent(msg, liveMeeting.wbModel.isMultiUser())
  }
}
