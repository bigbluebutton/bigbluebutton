package org.bigbluebutton.core.apps.chat

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ChatModel
import org.bigbluebutton.core.running.OutMsgRouter

trait SendPublicMessagePubMsgHdlr {
  this: ChatApp2x =>

  val outGW: OutMsgRouter

  def handleSendPublicMessagePubMsg(msg: SendPublicMessagePubMsg): Unit = {
    def broadcastEvent(msg: SendPublicMessagePubMsg, message: ChatMessageVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SendPublicMessageEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SendPublicMessageEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SendPublicMessageEvtMsgBody(msg.body.message)
      val event = SendPublicMessageEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    ChatModel.addNewChatMessage(liveMeeting.chatModel, msg.body.message)
    broadcastEvent(msg, msg.body.message)
  }
}
