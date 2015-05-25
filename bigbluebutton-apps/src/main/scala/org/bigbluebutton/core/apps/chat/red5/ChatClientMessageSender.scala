package org.bigbluebutton.core.apps.chat.red5

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService
import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage
import com.google.gson.Gson
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage
import scala.collection.mutable.HashMap
import collection.JavaConverters._
import scala.collection.JavaConversions._
import java.util.ArrayList

class ChatClientMessageSender(service: ConnectionInvokerService) extends OutMessageListener2 {
 
	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case msg: GetChatHistoryReply               => handleGetChatHistoryReply(msg)
	    case msg: SendPublicMessageEvent            => handleSendPublicMessageEvent(msg)
	    case msg: SendPrivateMessageEvent           => handleSendPrivateMessageEvent(msg)
	    case _ => // do nothing
	  }
	}   
  
  private def handleGetChatHistoryReply(msg: GetChatHistoryReply) {	
    val gson = new Gson();
    val message = new java.util.HashMap[String, Object]()
  	
  	val collection = new ArrayList[java.util.Map[String, String]]();
  	  
  	msg.history.foreach(p => {
  	    collection.add(mapAsJavaMap(p))
  	})
  	
  	val jsonMsg = gson.toJson(collection)
  	
//  	System.out.println("************ CHAT HISTORY = \n" + jsonMsg + "\n")
	  message.put("msg", jsonMsg)
  	  
	  val m = new DirectClientMessage(msg.meetingID, msg.requesterID, "ChatRequestMessageHistoryReply", message);
	  service.sendMessage(m);
  }
  
  private def handleSendPublicMessageEvent(msg: SendPublicMessageEvent) { 
    val gson = new Gson()
	  val jsonMsg = gson.toJson(mapAsJavaMap(msg.message))
//	System.out.println("************ PUBLIC CHAT MESSAGE = \n" + jsonMsg + "\n")
	  
	val m = new BroadcastClientMessage(msg.meetingID, "ChatReceivePublicMessageCommand", mapAsJavaMap(msg.message));
	service.sendMessage(m);    
  }
  
  private def handleSendPrivateMessageEvent(msg: SendPrivateMessageEvent) {
    msg.message.get("toUserID") match {
      case Some(uid) => {
 		val m = new DirectClientMessage(msg.meetingID, uid, "ChatReceivePrivateMessageCommand", mapAsJavaMap(msg.message));
		service.sendMessage(m);         
      }
      case None => // do nothing
    
    }
    	
	val m2 = new DirectClientMessage(msg.meetingID, msg.requesterID, "ChatReceivePrivateMessageCommand", mapAsJavaMap(msg.message));
	service.sendMessage(m2);    
  }

}