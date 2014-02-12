package org.bigbluebutton.core.apps.users.red5

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService
import org.bigbluebutton.conference.meeting.messaging.red5.SharedObjectClientMessage
import java.util.ArrayList
import java.util.Map
import java.util.HashMap
import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage
import com.google.gson.Gson
import scala.collection.JavaConversions._

class UsersClientMessageSender(service: ConnectionInvokerService) extends OutMessageListener2 {
	private val USERS_SO: String = "participantsSO"; 

	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case msg: EndAndKickAll => 
	                handleEndAndKickAll(msg)
	    case msg: PresenterAssigned => 
	                handleAssignPresenter(msg)
	    case msg: UserJoined => 
	                handleUserJoined(msg)
	    case msg: UserLeft => 
	                handleUserLeft(msg)
	    case msg: UserStatusChange => 
	                handleUserStatusChange(msg)
	    case msg: GetUsersReply => 
	                handleGetUsersReply(msg)
	    case msg: UserJoinedVoice =>
	                handleUserJoinedVoice(msg)
	    case msg: UserVoiceMuted =>
	                handleUserVoiceMuted(msg)
	    case msg: UserVoiceTalking =>
	                handleUserVoiceTalking(msg)
	    case msg: UserLeftVoice =>
	                handleUserLeftVoice(msg)
	    case _ => // println("Unhandled message in UsersClientMessageSender")
	  }
	}
	
	private def buildUserHashMap(user: UserVO):java.util.HashMap[String, Object] = {
	  val vu = user.voiceUser
	  val vuser = new HashMap[String, Object]()
	  vuser.put("userId", vu.userId)
	  vuser.put("webUserId", vu.webUserId)
	  vuser.put("callerName", vu.callerName)
	  vuser.put("callerNum", vu.callerNum)
	  vuser.put("joined", vu.joined:java.lang.Boolean)
	  vuser.put("locked", vu.locked:java.lang.Boolean)
	  vuser.put("muted", vu.muted:java.lang.Boolean)
	  vuser.put("talking", vu.talking:java.lang.Boolean)
	
	  val wuser = new HashMap[String, Object]()
	  wuser.put("userId", user.userID)
	  wuser.put("externUserID", user.externUserID)
	  wuser.put("name", user.name)
	  wuser.put("role", user.role.toString())
	  wuser.put("raiseHand", user.raiseHand:java.lang.Boolean)
	  wuser.put("presenter", user.presenter:java.lang.Boolean)
	  wuser.put("hasStream", user.hasStream:java.lang.Boolean)
	  wuser.put("locked", user.locked:java.lang.Boolean)
	  wuser.put("voiceUser", vuser)	  
	  
	  wuser
	}
	private def handleUserVoiceMuted(msg: UserVoiceMuted) {
	  val args = new java.util.HashMap[String, Object]();
	  args.put("meetingID", msg.meetingID);	  
	  args.put("voiceUserId", msg.user.voiceUser.userId);
	  args.put("muted", msg.user.voiceUser.muted:java.lang.Boolean);
	  
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	  message.put("msg", gson.toJson(args))
  	
  	  println("UsersClientMessageSender - handleUserVoiceMuted \n" + message.get("msg") + "\n")
//  	log.debug("UsersClientMessageSender - handlePresentationConversionProgress \n" + message.get("msg") + "\n")
      val m = new BroadcastClientMessage(msg.meetingID, "voiceUserMuted", message);
	  service.sendMessage(m);		  
	}
	
	private def handleUserVoiceTalking(msg: UserVoiceTalking) {
	  val args = new java.util.HashMap[String, Object]();
	  args.put("meetingID", msg.meetingID);	  
	  args.put("voiceUserId", msg.user.voiceUser.userId);
	  args.put("talking", msg.user.voiceUser.talking:java.lang.Boolean);
	  
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	  message.put("msg", gson.toJson(args))
  	
  	  println("UsersClientMessageSender - handleUserVoiceTalking \n" + message.get("msg") + "\n")
//  	log.debug("UsersClientMessageSender - handlePresentationConversionProgress \n" + message.get("msg") + "\n")
      val m = new BroadcastClientMessage(msg.meetingID, "voiceUserTalking", message);
	  service.sendMessage(m);	  
	}
	
	private def handleUserLeftVoice(msg: UserLeftVoice) {
	  
	}
	
	private def handleUserJoinedVoice(msg: UserJoinedVoice) {
	val args = new java.util.HashMap[String, Object]();
	args.put("meetingID", msg.meetingID);
	args.put("user", buildUserHashMap(msg.user))
	
	val message = new java.util.HashMap[String, Object]() 
	val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	
  	println("UsersClientMessageSender - handleUserJoinedVoice \n" + message.get("msg") + "\n")
//  	log.debug("UsersClientMessageSender - handlePresentationConversionProgress \n" + message.get("msg") + "\n")
    val m = new BroadcastClientMessage(msg.meetingID, "userJoinedVoice", message);
	service.sendMessage(m);	
			
	}
	
	private def handleGetUsersReply(msg: GetUsersReply):Unit = {
		var message = new HashMap[String, Object]();
			
		message.put("count", msg.users.length:java.lang.Integer)
		
		var users = new HashMap[String, Object]();
		
		println("*************** Users lenght=[" + msg.users.length + "]")
		
		msg.users.foreach(uvo => {
  		  var pm = new HashMap[String, Object]();

		  pm.put("userID", uvo.userID)
		  pm.put("externUserID", uvo.externUserID)
		  pm.put("name", uvo.name)
		  pm.put("role", uvo.role.toString())
		  pm.put("hasStream", uvo.hasStream:java.lang.Boolean)
		  pm.put("presenter", uvo.presenter:java.lang.Boolean)
		  pm.put("raiseHand", uvo.raiseHand:java.lang.Boolean)
		  
		  users.put(uvo.userID, pm)
		})
		
		message.put("users", users);
		
		val gson = new Gson()
		val msgString = gson.toJson(message)
		
		println("JSON = \n" + msgString)
			
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

		val gson = new Gson()
		val msgString = gson.toJson(message)
		
		println("JSON = \n" + msgString)
		
		var m = new BroadcastClientMessage(msg.meetingID, "assignPresenterCallback", message);
		service.sendMessage(m);		
	}
	
	private def handleUserJoined(msg: UserJoined):Unit = {
		var message = new HashMap[String, Object]();
		message.put("userID", msg.user.userID);
		message.put("externUserID", msg.user.externUserID);
		message.put("name", msg.user.name);
		message.put("role", msg.user.role.toString());
		message.put("raiseHand", msg.user.raiseHand:java.lang.Boolean)
		message.put("presenter", msg.user.presenter:java.lang.Boolean)
		message.put("hasStream", msg.user.hasStream:java.lang.Boolean)
		
		val gson = new Gson()
		val msgString = gson.toJson(message)
		
		println("JSON = \n" + msgString)
		
		var m = new BroadcastClientMessage(msg.meetingID, "participantJoined", message);
		service.sendMessage(m);		
	}


	private def handleUserLeft(msg: UserLeft):Unit = {
		var message = new HashMap[String, Object]();
		message.put("userID", msg.user.userID);
		
		val gson = new Gson()
		val msgString = gson.toJson(message)
		
		println("JSON = \n" + msgString)
		
		var m = new BroadcastClientMessage(msg.meetingID, "participantLeft", message);
		service.sendMessage(m);
	}

	private def handleUserStatusChange(msg: UserStatusChange):Unit = {
		var message = new HashMap[String, Object]();
		message.put("userID", msg.userID);
		message.put("status", msg.status);
		message.put("value", msg.value);
		
		val gson = new Gson()
		val msgString = gson.toJson(message)
		
		println("JSON = \n" + msgString)
		
		var m = new BroadcastClientMessage(msg.meetingID, "participantStatusChange", message);
		service.sendMessage(m);
	}
}