package org.bigbluebutton.core.apps.chat

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait SendPrivateMessagePubMsgHdlr {
  this: ChatApp2x =>

  val outGW: OutMsgRouter

  def handleSendPrivateMessagePubMsg(msg: SendPrivateMessagePubMsg): Unit = {
    def broadcastEvent(message: ChatMessageVO, userId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, userId)
      val envelope = BbbCoreEnvelope(SendPrivateMessageEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SendPrivateMessageEvtMsg.NAME, liveMeeting.props.meetingProp.intId, userId)

      val body = SendPrivateMessageEvtMsgBody(message)
      val event = SendPrivateMessageEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    broadcastEvent(msg.body.message, msg.body.message.fromUserId)
    broadcastEvent(msg.body.message, msg.body.message.toUserId)
  }
}
