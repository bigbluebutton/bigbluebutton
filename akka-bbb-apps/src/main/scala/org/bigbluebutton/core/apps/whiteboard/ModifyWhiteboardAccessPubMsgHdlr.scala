package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.{ LiveMeeting }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus

trait ModifyWhiteboardAccessPubMsgHdlr {
  this: WhiteboardApp2x =>

  def handle(msg: ModifyWhiteboardAccessPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: ModifyWhiteboardAccessPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(ModifyWhiteboardAccessEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ModifyWhiteboardAccessEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = ModifyWhiteboardAccessEvtMsgBody(msg.body.multiUser)
      val event = ModifyWhiteboardAccessEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    modifyWhiteboardAccess(msg.body.multiUser, liveMeeting)
    broadcastEvent(msg)
  }
}
