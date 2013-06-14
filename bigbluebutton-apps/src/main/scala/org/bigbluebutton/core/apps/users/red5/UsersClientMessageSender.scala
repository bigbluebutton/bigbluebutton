package org.bigbluebutton.core.apps.users.red5

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService
import org.bigbluebutton.core.api.OutMessage
import org.bigbluebutton.core.apps.users.messages._
import org.bigbluebutton.conference.meeting.messaging.red5.SharedObjectClientMessage
import java.util.ArrayList
import java.util.Map
import java.util.HashMap
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage

class UsersClientMessageSender(service: ConnectionInvokerService) extends OutMessageListener2 {
	private val USERS_SO: String = "participantsSO"; 

	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case endMsg: EndAndKickAll => handleEndAndKickAll(endMsg)
	    case assignPres: AssignPresenter => handleUssignPresenter(assignPres)
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
		var m  = new SharedObjectClientMessage(msg.meetingID, USERS_SO, "logout", new ArrayList[Object]());
		service.sendMessage(m);
	}


	private def handleUssignPresenter(msg:AssignPresenter):Unit = {
		var presenter = new ArrayList[Object]();
		presenter.add(msg.newPresenterID);
		presenter.add(msg.newPresenterName);
		presenter.add(msg.assignedBy);
		
		var m = new SharedObjectClientMessage(msg.meetingID, USERS_SO, "assignPresenterCallback", presenter);
		service.sendMessage(m);		
	}
	

	private def handleUserJoined(msg: UserJoined):Unit = {
		var m = new HashMap[String, Object]();
		m.put("userid", msg.internalUserID);
		m.put("externUserID", msg.externalUserID);
		m.put("name", msg.name);
		m.put("role", msg.role);
		m.put("raiseHand", msg.raiseHand:java.lang.Boolean)
		m.put("presenter", msg.presenter:java.lang.Boolean)
		m.put("hasStream", msg.hasStream:java.lang.Boolean)
		
		var args = new ArrayList[Object]();
		args.add(m);

		println("Sending participantJoined message")
		
		var som = new SharedObjectClientMessage(msg.meetingID, USERS_SO, "participantJoined", args);
		service.sendMessage(som);
	}


	private def handleUserLeft(msg: UserLeft):Unit = {
		var args = new ArrayList[Object]();
		args.add(msg.meetingID);

		println("Sending participantLeft message")
		
		var m = new SharedObjectClientMessage(msg.meetingID, USERS_SO, "participantLeft", args);
		service.sendMessage(m);
	}

	private def handleUserStatusChange(msg: UserStatusChange):Unit = {
		var args = new ArrayList[Object]();
		args.add(msg.userID);
		args.add(msg.status);
		args.add(msg.value);
		
		println("Sending participantStatusChange message")
		
		var m = new SharedObjectClientMessage(msg.meetingID, USERS_SO, "participantStatusChange", args);
		service.sendMessage(m);
	}
}