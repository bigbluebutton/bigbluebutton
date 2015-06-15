package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.MeetingActor

trait ChatApp {
  this: MeetingActor =>

  val outGW: MessageOutGateway

  def handleGetChatHistoryRequest(msg: GetChatHistoryRequest) {
    val history = chatModel.getChatHistory()
    outGW.send(new GetChatHistoryReply(meetingID, recorded, msg.requesterID, msg.replyTo, history))
  }

  def handleSendPublicMessageRequest(msg: SendPublicMessageRequest) {
    chatModel.addNewChatMessage(msg.message.toMap)
    val pubMsg = msg.message.toMap

    outGW.send(new SendPublicMessageEvent(meetingID, recorded, msg.requesterID, pubMsg))
  }

  def handleSendPrivateMessageRequest(msg: SendPrivateMessageRequest) {
    val privMsg = msg.message.toMap
    outGW.send(new SendPrivateMessageEvent(meetingID, recorded, msg.requesterID, privMsg))
  }
}