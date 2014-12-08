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
	    case msg:BroadcastLayoutEvent                  => handleBroadcastLayoutEvent(msg)
	    case msg:LockLayoutEvent                       => handleLockLayoutEvent(msg)
	    case _ => // do nothing
	  }
	}  
	
	private def handleGetCurrentLayoutReply(msg: GetCurrentLayoutReply) {
	  val message = new java.util.HashMap[String, Object]()  	
	  message.put("locked", msg.locked:java.lang.Boolean);
	  message.put("setById", msg.setByUserID);
	  message.put("layout", msg.layoutID);
  	  
    var m = new DirectClientMessage(msg.meetingID, msg.requesterID, "getCurrentLayoutResponse", message);
  	service.sendMessage(m);	  
	}
		
	private def handleBroadcastLayoutEvent(msg: BroadcastLayoutEvent) {
	  val message = new java.util.HashMap[String, Object]()  	
	  message.put("locked", msg.locked:java.lang.Boolean);
	  message.put("setByUserID", msg.setByUserID);
	  message.put("layout", msg.layoutID);
	  
	  msg.applyTo foreach {u =>
	    var m = new DirectClientMessage(msg.meetingID, u.userID, "syncLayout", message);
	    service.sendMessage(m);	    
	  }  
	}
	
	private def handleLockLayoutEvent(msg: LockLayoutEvent) {
	  val message = new java.util.HashMap[String, Object]()  	
	  message.put("locked", msg.locked:java.lang.Boolean);
	  message.put("setById", msg.setById);
    
	  msg.applyTo foreach {u =>
	    var m = new DirectClientMessage(msg.meetingID, u.userID, "layoutLocked", message);
	    service.sendMessage(m);	    
	  };
	}
}