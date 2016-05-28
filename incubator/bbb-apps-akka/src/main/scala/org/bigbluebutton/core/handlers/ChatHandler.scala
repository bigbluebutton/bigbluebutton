package org.bigbluebutton.core.handlers

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.LiveMeeting
import org.bigbluebutton.core.LiveMeeting

trait ChatHandler {
  this: LiveMeeting =>

  val outGW: OutMessageGateway

  def handleGetChatHistoryRequest(msg: GetChatHistoryRequest) {
    val history = chatModel.getChatHistory()
    outGW.send(new GetChatHistoryReply(props.id, props.recorded, msg.requesterId, msg.replyTo, history))
  }

  def handleSendPublicMessageRequest(msg: SendPublicMessageRequest) {
    chatModel.addNewChatMessage(msg.message.toMap)
    val pubMsg = msg.message.toMap

    outGW.send(new SendPublicMessageEvent(props.id, props.recorded, msg.requesterId, pubMsg))
  }

  def handleSendPrivateMessageRequest(msg: SendPrivateMessageRequest) {
    val privMsg = msg.message.toMap
    outGW.send(new SendPrivateMessageEvent(props.id, props.recorded, msg.requesterId, privMsg))
  }
}