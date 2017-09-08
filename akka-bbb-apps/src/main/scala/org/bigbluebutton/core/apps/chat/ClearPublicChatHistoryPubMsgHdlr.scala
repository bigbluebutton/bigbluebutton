package org.bigbluebutton.core.apps.chat

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ChatModel
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting }

trait ClearPublicChatHistoryPubMsgHdlr {
  this: ChatApp2x =>

  def handle(msg: ClearPublicChatHistoryPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastEvent(msg: ClearPublicChatHistoryPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(ClearPublicChatHistoryEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ClearPublicChatHistoryEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = ClearPublicChatHistoryEvtMsgBody()
      val event = ClearPublicChatHistoryEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    ChatModel.clearPublicChatHistory(liveMeeting.chatModel)
    broadcastEvent(msg)
  }

}
