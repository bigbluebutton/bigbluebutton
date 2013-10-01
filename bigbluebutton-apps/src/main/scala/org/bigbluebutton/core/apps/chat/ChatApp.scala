package org.bigbluebutton.core.apps.chat

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.MessageOutGateway
import scala.collection.mutable.ArrayBuffer

class ChatApp(meetingID: String, recorded: Boolean, outGW: MessageOutGateway) {
	import org.bigbluebutton.core.apps.chat.messages._
	
	val messages = new ArrayBuffer[Map[String, String]]()
	
    def handleMessage(msg: InMessage):Unit = {
	    msg match {
	      case getChatHistoryRequest: GetChatHistoryRequest => handleGetChatHistoryRequest(getChatHistoryRequest)
	      case sendPublicMessageRequest: SendPublicMessageRequest => handleSendPublicMessageRequest(sendPublicMessageRequest)
	      case sendPrivateMessageRequest: SendPrivateMessageRequest => handleSendPrivateMessageRequest(sendPrivateMessageRequest)
	      case _ => // do nothing
	    }
    }	
	
	private def handleGetChatHistoryRequest(msg: GetChatHistoryRequest) {
	  val history  = new Array[Map[String, String]](messages.size)
	  messages.copyToArray(history)
	  outGW.send(new GetChatHistoryReply(meetingID, recorded, msg.requesterID, history))
	}
	
	private def handleSendPublicMessageRequest(msg: SendPublicMessageRequest) {
	  messages append msg.message.toMap	  
	  val pubMsg = msg.message.toMap
	  
	  outGW.send(new SendPublicMessageEvent(meetingID, recorded, msg.requesterID, pubMsg))
	}
	
	private def handleSendPrivateMessageRequest(msg: SendPrivateMessageRequest) {
	  val pubMsg = msg.message.toMap	  
	  outGW.send(new SendPrivateMessageEvent(meetingID, recorded, msg.requesterID, pubMsg))	  
	}
	
}