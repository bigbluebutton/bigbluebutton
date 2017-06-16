package org.bigbluebutton.core2.message.handlers.whiteboard

import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.messages.MessageBody.{ ModifyWhiteboardAccessEvtMsgBody }
import org.bigbluebutton.common2.messages._

trait ModifyWhiteboardAccessPubMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleModifyWhiteboardAccessPubMsg(msg: ModifyWhiteboardAccessPubMsg): Unit = {

    def broadcastEvent(msg: ModifyWhiteboardAccessPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST, props.meetingProp.intId, msg.header.userId)
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