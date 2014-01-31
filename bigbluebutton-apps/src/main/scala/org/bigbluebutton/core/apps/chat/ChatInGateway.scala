package org.bigbluebutton.core.apps.chat

import org.bigbluebutton.core.BigBlueButtonGateway
import org.bigbluebutton.core.api._

class ChatInGateway(bbbGW: BigBlueButtonGateway) {

  def getChatHistory(meetingID: String, requesterID: String) {
    bbbGW.accept(new GetChatHistoryRequest(meetingID, requesterID))
  }
  
  def sendPrivateMessage(meetingID: String, requesterID: String, msg: Map[String, String]) {
    bbbGW.accept(new SendPrivateMessageRequest(meetingID, requesterID, msg))
  }
  
  def sendPublicMessage(meetingID: String, requesterID: String, msg: Map[String, String]) {
    bbbGW.accept(new SendPublicMessageRequest(meetingID, requesterID, msg))
  }
}