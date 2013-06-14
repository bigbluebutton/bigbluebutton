package org.bigbluebutton.core.apps.users.red5

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService
import org.bigbluebutton.core.apps.users.messages._
import org.bigbluebutton.conference.meeting.messaging.red5.SharedObjectClientMessage
import java.util.ArrayList
import java.util.Map
import java.util.HashMap
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage
import org.bigbluebutton.core.api.PresenterAssigned

class UsersClientMessageSender(service: ConnectionInvokerService) extends OutMessageListener2 {
	private val USERS_SO: String = "participantsSO"; 

	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case endMsg: EndAndKickAll => handleEndAndKickAll(endMsg)
	    case assignPres: PresenterAssigned => handleAssignPresenter(assignPres)
	    case userJoin: UserJoined => handleUserJoined(userJoin)
	    case userLeft: UserLeft => handleUserLeft(userLeft)
	    case statusChange: UserStatusChange => handleUserStatusChange(statusChange)
	    case getUsersReply: GetUsersReply => handleGetUsersReply(getUsersReply)
	    case _ => println("Unhandled message in UsersClientMessageSender")
	  }
	}
	
	private def handleGetUsersReply(msg: GetUsersReply):Unit = {
		var message = new HashMap[String, Object]();
		
		println("Sending getUsersReply message. num users = [" + msg.users.size() + "]")
		
		message.put("count", msg.users.size():java.lang.Integer)
		
		var users = new HashMap[String, Object]();
		
		val it = msg.users.iterator
		while(it.hasNext() ) {
		  var pm = new HashMap[String, Object]();
		  var uvo = it.next()
		  pm.put("userID", uvo.userID)
		  pm.put("externUserID", uvo.externUserID)
		  pm.put("name", uvo.name)
		  pm.put("role", uvo.role)
		  pm.put("hasStream", uvo.hasStream:java.lang.Boolean)
		  pm.put("presenter", uvo.presenter:java.lang.Boolean)
		  pm.put("raiseHand", uvo.raiseHand:java.lang.Boolean)
		  
		  users.put(uvo.userID, pm)
		}	
		
		message.put("users", users);
			
		var m = new DirectClientMessage(msg.meetingID, msg.requesterID, "getUsersReply", message);
		service.sendMessage(m);	  
	}
		
	private def handleEndAndKickAll(msg: EndAndKickAll):Unit = {
	  var message = new HashMap[String, Object]();
	  var m = new BroadcastClientMessage(msg.meetingID, "logout", message);
	  service.sendMessage(m);
	}


	private def handleAssignPresenter(msg:PresenterAssigned):Unit = {
	  	var message = new HashMap[String, Object]();
		message.put("newPresenterID", msg.presenter.presenterID);
		message.put("newPresenterName", msg.presenter.presenterName);
		message.put("assignedBy", msg.presenter.assignedBy);
		
		var m = new BroadcastClientMessage(msg.meetingID, "assignPresenterCallback", message);
		service.sendMessage(m);
			
	}
	

	private def handleUserJoined(msg: UserJoined):Unit = {
		var message = new HashMap[String, Object]();
		message.put("userID", msg.internalUserID);
		message.put("externUserID", msg.externalUserID);
		message.put("name", msg.name);
		message.put("role", msg.role);
		message.put("raiseHand", msg.raiseHand:java.lang.Boolean)
		message.put("presenter", msg.presenter:java.lang.Boolean)
		message.put("hasStream", msg.hasStream:java.lang.Boolean)
		
		var m = new BroadcastClientMessage(msg.meetingID, "participantJoined", message);
		service.sendMessage(m);

		println("Sending participantJoined message")
		
	}


	private def handleUserLeft(msg: UserLeft):Unit = {
		var message = new HashMap[String, Object]();
		message.put("userID", msg.userID);
		
		println("Sending participantLeft message")
		var m = new BroadcastClientMessage(msg.meetingID, "participantLeft", message);
		service.sendMessage(m);
	}

	private def handleUserStatusChange(msg: UserStatusChange):Unit = {
		var message = new HashMap[String, Object]();
		message.put("userID", msg.userID);
		message.put("status", msg.status);
		message.put("value", msg.value);
		
		println("Sending participantStatusChange message")
		var m = new BroadcastClientMessage(msg.meetingID, "participantStatusChange", message);
		service.sendMessage(m);
	}
}