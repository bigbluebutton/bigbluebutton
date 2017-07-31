package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.{ OutMsgRouter }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.MeetingActor

trait SyncWhiteboardAccessRespMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleSyncWhiteboardAccessRespMsg(): Unit = {

    def broadcastEvent(multiUser: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, props.meetingProp.intId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(SyncGetWhiteboardAccessRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SyncGetWhiteboardAccessRespMsg.NAME, props.meetingProp.intId, "nodeJSapp")

      val body = SyncGetWhiteboardAccessRespMsgBody(multiUser)
      val event = SyncGetWhiteboardAccessRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    broadcastEvent(getWhiteboardAccess())
  }
}
