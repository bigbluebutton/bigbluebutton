package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.{ MeetingProperties, OutMessageGateway }

trait ChatApp {

  val mProps: MeetingProperties
  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleGetChatHistoryRequest(msg: GetChatHistoryRequest) {
    val history = liveMeeting.chatModel.getChatHistory()
    outGW.send(new GetChatHistoryReply(mProps.meetingID, mProps.recorded, msg.requesterID, msg.replyTo, history))
  }

  def handleSendPublicMessageRequest(msg: SendPublicMessageRequest) {
    liveMeeting.chatModel.addNewChatMessage(msg.message)
    val pubMsg = msg.message

    outGW.send(new SendPublicMessageEvent(mProps.meetingID, mProps.recorded, msg.requesterID, pubMsg))
  }

  def handleSendPrivateMessageRequest(msg: SendPrivateMessageRequest) {
    val privMsg = msg.message
    outGW.send(new SendPrivateMessageEvent(mProps.meetingID, mProps.recorded, msg.requesterID, privMsg))
  }

  def handleClearPublicChatHistoryRequest(msg: ClearPublicChatHistoryRequest) {
    liveMeeting.chatModel.clearPublicChatHistory()
    outGW.send(new ClearPublicChatHistoryReply(mProps.meetingID, mProps.recorded, msg.requesterID))
  }

}