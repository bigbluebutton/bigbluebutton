package org.bigbluebutton.core.apps.layout.red5

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService
import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage
import com.google.gson.Gson
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage

class LayoutClientMessageSender(service: ConnectionInvokerService) extends OutMessageListener2 {

	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case msg:GetCurrentLayoutReply                 => handleGetCurrentLayoutReply(msg)
	    case msg:SetLayoutEvent                        => handleSetLayoutEvent(msg)
	    case msg:LockLayoutEvent                       => handleLockLayoutEvent(msg)
	    case msg:UnlockLayoutEvent                     => handleUnlockLayoutEvent(msg)
	    case _ => // do nothing
	  }
	}  
	
	private def handleGetCurrentLayoutReply(msg: GetCurrentLayoutReply) {
	  val message = new java.util.HashMap[String, Object]()  	
	  message.put("locked", msg.locked:java.lang.Boolean);
	  message.put("setByUserID", msg.setByUserID);
	  message.put("layout", msg.layoutID);
  	  
    var m = new DirectClientMessage(msg.meetingID, msg.requesterID, "getCurrentLayoutResponse", message);
  	service.sendMessage(m);	  
	}
	
	private def handleSetLayoutEvent(msg: SetLayoutEvent) {
	  val message = new java.util.HashMap[String, Object]()  	
	  message.put("locked", msg.locked:java.lang.Boolean);
	  message.put("setByUserID", msg.setByUserID);
	  message.put("layout", msg.layoutID);	  
	  
	  var m = new BroadcastClientMessage(msg.meetingID, "syncLayout", message);
	  service.sendMessage(m);
	}
	
	private def handleLockLayoutEvent(msg: LockLayoutEvent) {
	  val message = new java.util.HashMap[String, Object]()  	
	  message.put("locked", msg.locked:java.lang.Boolean);
	  message.put("setByUserID", msg.setByUserID);
	  message.put("layout", msg.layoutID);
	  
	  var m = new BroadcastClientMessage(msg.meetingID, "remoteUpdateLayout", message);
	  service.sendMessage(m);
	}
	
	private def handleUnlockLayoutEvent(msg: UnlockLayoutEvent) {
	  val message = new java.util.HashMap[String, Object]()  	
	  message.put("locked", msg.locked:java.lang.Boolean);
	  message.put("setByUserID", msg.setByUserID);
	  message.put("layout", msg.layoutID);	  
	  
	  var m = new BroadcastClientMessage(msg.meetingID, "remoteUpdateLayout", message);
	  service.sendMessage(m);
	}
}