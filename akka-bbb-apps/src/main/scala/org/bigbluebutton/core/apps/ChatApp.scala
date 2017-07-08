package org.bigbluebutton.core.apps

import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.{ OutMessageGateway }

trait ChatApp {

  val props: DefaultProps
  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleGetChatHistoryRequest(msg: GetChatHistoryRequest) {
    val history = liveMeeting.chatModel.getChatHistory()
    //outGW.send(new GetChatHistoryReply(props.meetingProp.intId, props.recordProp.record, msg.requesterID, msg.replyTo, history))
  }

  def handleSendPublicMessageRequest(msg: SendPublicMessageRequest) {
    liveMeeting.chatModel.addNewChatMessage(msg.message)
    val pubMsg = msg.message

    //outGW.send(new SendPublicMessageEvent(props.meetingProp.intId, props.recordProp.record, msg.requesterID, pubMsg))
  }

  def handleSendPrivateMessageRequest(msg: SendPrivateMessageRequest) {
    val privMsg = msg.message
    //outGW.send(new SendPrivateMessageEvent(props.meetingProp.intId, props.recordProp.record, msg.requesterID, privMsg))
  }

  def handleClearPublicChatHistoryRequest(msg: ClearPublicChatHistoryRequest) {
    liveMeeting.chatModel.clearPublicChatHistory()
    //outGW.send(new ClearPublicChatHistoryReply(props.meetingProp.intId, props.recordProp.record, msg.requesterID))
  }

}