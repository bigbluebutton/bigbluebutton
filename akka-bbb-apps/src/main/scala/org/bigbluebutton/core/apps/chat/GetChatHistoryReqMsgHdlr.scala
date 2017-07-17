package org.bigbluebutton.core.apps.chat

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ChatModel

trait GetChatHistoryReqMsgHdlr {
  this: ChatApp2x =>

  val outGW: OutMessageGateway

  def handleGetChatHistoryReqMsg(msg: GetChatHistoryReqMsg): Unit = {
    def broadcastEvent(msg: GetChatHistoryReqMsg, history: Array[ChatMessageVO]): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(GetChatHistoryRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetChatHistoryRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = GetChatHistoryRespMsgBody(history)
      val event = GetChatHistoryRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    val history = ChatModel.getChatHistory(liveMeeting.chatModel)
    broadcastEvent(msg, history)
  }
}
