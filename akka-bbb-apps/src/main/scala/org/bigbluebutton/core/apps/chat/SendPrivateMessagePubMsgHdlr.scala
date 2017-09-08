package org.bigbluebutton.core.apps.chat

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait SendPrivateMessagePubMsgHdlr {
  this: ChatApp2x =>

  def handle(msg: SendPrivateMessagePubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastEvent(message: ChatMessageVO, userId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, userId)
      val envelope = BbbCoreEnvelope(SendPrivateMessageEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SendPrivateMessageEvtMsg.NAME, liveMeeting.props.meetingProp.intId, userId)

      val body = SendPrivateMessageEvtMsgBody(message)
      val event = SendPrivateMessageEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    broadcastEvent(msg.body.message, msg.body.message.fromUserId)
    broadcastEvent(msg.body.message, msg.body.message.toUserId)
  }
}
