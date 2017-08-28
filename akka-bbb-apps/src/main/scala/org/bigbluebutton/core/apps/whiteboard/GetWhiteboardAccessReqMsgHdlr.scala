package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.{ OutMsgRouter }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.MeetingActor

trait GetWhiteboardAccessReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

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
