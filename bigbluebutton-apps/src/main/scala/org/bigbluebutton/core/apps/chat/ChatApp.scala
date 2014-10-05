package org.bigbluebutton.core.apps.chat

import org.bigbluebutton.core.api._
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.MeetingActor

trait ChatApp {
  this : MeetingActor =>
  
  val outGW: MessageOutGateway
  
  val messages = new ArrayBuffer[Map[String, String]]()
		
  def handleGetChatHistoryRequest(msg: GetChatHistoryRequest) {
    val history  = new Array[Map[String, String]](messages.size)
    messages.copyToArray(history)
    outGW.send(new GetChatHistoryReply(meetingID, recorded, msg.requesterID, msg.replyTo, history))
  }
	
  def handleSendPublicMessageRequest(msg: SendPublicMessageRequest) {
	  messages append msg.message.toMap	  
	  val pubMsg = msg.message.toMap
	  
	  outGW.send(new SendPublicMessageEvent(meetingID, recorded, msg.requesterID, pubMsg))
  }
	
  def handleSendPrivateMessageRequest(msg: SendPrivateMessageRequest) {
	  val pubMsg = msg.message.toMap	  
	  outGW.send(new SendPrivateMessageEvent(meetingID, recorded, msg.requesterID, pubMsg))	  
  }
}