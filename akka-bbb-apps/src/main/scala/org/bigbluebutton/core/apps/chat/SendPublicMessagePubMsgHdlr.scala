package org.bigbluebutton.core.apps.chat

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ChatModel
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting, LogHelper }

trait SendPublicMessagePubMsgHdlr extends LogHelper {

  def handle(msg: SendPublicMessagePubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("SENDING CHAT MESSAGE")

    def broadcastEvent(msg: SendPublicMessagePubMsg, message: ChatMessageVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SendPublicMessageEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SendPublicMessageEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SendPublicMessageEvtMsgBody(msg.body.message)
      val event = SendPublicMessageEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    ChatModel.addNewChatMessage(liveMeeting.chatModel, msg.body.message)
    broadcastEvent(msg, msg.body.message)
  }
}
