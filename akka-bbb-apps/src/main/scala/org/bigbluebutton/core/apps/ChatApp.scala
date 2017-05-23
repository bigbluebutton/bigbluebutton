package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._

import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor }

trait ChatApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetChatHistoryRequest(msg: GetChatHistoryRequest) {
    val history = liveMeeting.chatModel.getChatHistory()
    outGW.send(new GetChatHistoryReply(mProps.meetingID, mProps.recorded, msg.requesterID, msg.replyTo, history))
  }

  def handleSendPublicMessageRequest(msg: SendPublicMessageRequest) {
    liveMeeting.chatModel.addNewChatMessage(msg.message.toMap)
    val pubMsg = msg.message.toMap

    outGW.send(new SendPublicMessageEvent(mProps.meetingID, mProps.recorded, msg.requesterID, pubMsg))
  }

  def handleSendPrivateMessageRequest(msg: SendPrivateMessageRequest) {
    val privMsg = msg.message.toMap
    outGW.send(new SendPrivateMessageEvent(mProps.meetingID, mProps.recorded, msg.requesterID, privMsg))
  }

  def handleClearPublicChatHistoryRequest(msg: ClearPublicChatHistoryRequest) {
    liveMeeting.chatModel.clearPublicChatHistory()
    outGW.send(new ClearPublicChatHistoryReply(mProps.meetingID, mProps.recorded, msg.requesterID))
  }

}