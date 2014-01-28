package org.bigbluebutton.core.apps.layout.red5

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage
import com.google.gson.Gson
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage

class LayoutClientMessageSender(service: ConnectionInvokerService) extends OutMessageListener2 {
	import org.bigbluebutton.core.apps.layout.messages._

	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case getCurrentLayoutReply:GetCurrentLayoutReply => handleGetCurrentLayoutReply(getCurrentLayoutReply)
	    case setLayoutEvent:SetLayoutEvent => handleSetLayoutEvent(setLayoutEvent)
	    case lockLayoutEvent:LockLayoutEvent => handleLockLayoutEvent(lockLayoutEvent)
	    case unlockLayoutEvent:UnlockLayoutEvent => handleUnlockLayoutEvent(unlockLayoutEvent)
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
	  
	  var m = new BroadcastClientMessage(msg.meetingID, "remoteUpdateLayout", message);
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