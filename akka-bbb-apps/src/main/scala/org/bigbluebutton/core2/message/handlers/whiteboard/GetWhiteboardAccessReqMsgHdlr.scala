package org.bigbluebutton.core2.message.handlers.whiteboard

import org.bigbluebutton.common2.messages.Whiteboard.{ GetWhiteboardAccessReqMsg, GetWhiteboardAccessRespMsg, GetWhiteboardAccessRespMsgBody }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.messages._

trait GetWhiteboardAccessReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetWhiteboardAccessReqMsg(msg: GetWhiteboardAccessReqMsg): Unit = {

    def broadcastEvent(msg: GetWhiteboardAccessReqMsg, multiUser: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(GetWhiteboardAccessRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetWhiteboardAccessRespMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = GetWhiteboardAccessRespMsgBody(multiUser)
      val event = GetWhiteboardAccessRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    broadcastEvent(msg, getWhiteboardAccess())
  }
}