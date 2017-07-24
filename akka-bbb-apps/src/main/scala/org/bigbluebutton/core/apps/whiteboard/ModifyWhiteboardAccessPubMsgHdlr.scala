package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.{ OutMsgRouter }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.MeetingActor

trait ModifyWhiteboardAccessPubMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleModifyWhiteboardAccessPubMsg(msg: ModifyWhiteboardAccessPubMsg): Unit = {

    def broadcastEvent(msg: ModifyWhiteboardAccessPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(ModifyWhiteboardAccessEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ModifyWhiteboardAccessEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = ModifyWhiteboardAccessEvtMsgBody(msg.body.multiUser)
      val event = ModifyWhiteboardAccessEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    modifyWhiteboardAccess(msg.body.multiUser)
    broadcastEvent(msg)
  }
}
