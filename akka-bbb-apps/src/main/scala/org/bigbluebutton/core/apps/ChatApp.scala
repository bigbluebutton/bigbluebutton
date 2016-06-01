package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.LiveMeeting

trait ChatApp {
  this: LiveMeeting =>

  val outGW: OutMessageGateway

  def handleGetChatHistoryRequest(msg: GetChatHistoryRequest) {
    val history = chatModel.getChatHistory()
    outGW.send(new GetChatHistoryReply(mProps.meetingID, mProps.recorded, msg.requesterID, msg.replyTo, history))
  }

  def handleSendPublicMessageRequest(msg: SendPublicMessageRequest) {
    chatModel.addNewChatMessage(msg.message.toMap)
    val pubMsg = msg.message.toMap

    outGW.send(new SendPublicMessageEvent(mProps.meetingID, mProps.recorded, msg.requesterID, pubMsg))
  }

  def handleSendPrivateMessageRequest(msg: SendPrivateMessageRequest) {
    val privMsg = msg.message.toMap
    outGW.send(new SendPrivateMessageEvent(mProps.meetingID, mProps.recorded, msg.requesterID, privMsg))
  }
}