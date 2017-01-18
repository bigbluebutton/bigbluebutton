package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.{ MeetingActor, MeetingStateModel }

trait ChatApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway
  val state: MeetingStateModel

  def handleGetChatHistoryRequest(msg: GetChatHistoryRequest) {
    val history = state.chatModel.getChatHistory()
    outGW.send(new GetChatHistoryReply(state.mProps.meetingID, state.mProps.recorded, msg.requesterID, msg.replyTo, history))
  }

  def handleSendPublicMessageRequest(msg: SendPublicMessageRequest) {
    state.chatModel.addNewChatMessage(msg.message.toMap)
    val pubMsg = msg.message.toMap

    outGW.send(new SendPublicMessageEvent(state.mProps.meetingID, state.mProps.recorded, msg.requesterID, pubMsg))
  }

  def handleSendPrivateMessageRequest(msg: SendPrivateMessageRequest) {
    val privMsg = msg.message.toMap
    outGW.send(new SendPrivateMessageEvent(state.mProps.meetingID, state.mProps.recorded, msg.requesterID, privMsg))
  }
}