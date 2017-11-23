package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.{ LiveMeeting }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus

trait SyncWhiteboardAccessRespMsgHdlr {
  this: WhiteboardApp2x =>

  def handle(liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(multiUser: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(SyncGetWhiteboardAccessRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SyncGetWhiteboardAccessRespMsg.NAME, liveMeeting.props.meetingProp.intId, "nodeJSapp")

      val body = SyncGetWhiteboardAccessRespMsgBody(multiUser)
      val event = SyncGetWhiteboardAccessRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    broadcastEvent(liveMeeting.wbModel.isMultiUser())
  }
}
