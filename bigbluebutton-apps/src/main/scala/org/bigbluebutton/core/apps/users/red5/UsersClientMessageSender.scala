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
import org.bigbluebutton.conference.meeting.messaging.red5.DisconnectAllClientsMessage
import org.bigbluebutton.conference.meeting.messaging.red5.DisconnectClientMessage

class UsersClientMessageSender(service: ConnectionInvokerService) extends OutMessageListener2 {
	
	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case msg: MeetingEnded                           => handleMeetingEnded(msg)
	    case msg: DisconnectAllUsers                     => handleDisconnectAllUsers(msg)
	    case msg: MeetingHasEnded                        => handleMeetingHasEnded(msg)
	    case msg: DisconnectUser                         => handleDisconnectUser(msg)
	    case msg: PresenterAssigned                      => handleAssignPresenter(msg)
	    case msg: UserJoined                             => handleUserJoined(msg)
	    case msg: UserLeft                               => handleUserLeft(msg)
	    case msg: UserStatusChange                       => handleUserStatusChange(msg)
	    case msg: UserRaisedHand                         => handleUserRaisedHand(msg)
	    case msg: UserLoweredHand                        => handleUserLoweredHand(msg)
	    case msg: UserSharedWebcam                       => handleUserSharedWebcam(msg)
	    case msg: UserUnsharedWebcam                     => handleUserUnshareWebcam(msg)	                
	    case msg: GetUsersReply                          => handleGetUsersReply(msg)
	    case msg: UserJoinedVoice                        => handleUserJoinedVoice(msg)
	    case msg: UserVoiceMuted                         => handleUserVoiceMuted(msg)
	    case msg: UserVoiceTalking                       => handleUserVoiceTalking(msg)
	    case msg: UserLeftVoice                          => handleUserLeftVoice(msg)
	    case msg: RecordingStatusChanged                 => handleRecordingStatusChanged(msg)
	    case msg: GetRecordingStatusReply                => handleGetRecordingStatusReply(msg)
	    case msg: ValidateAuthTokenReply                 => handleValidateAuthTokenReply(msg)
	    case msg: UserRegistered                         => handleRegisteredUser(msg)
	    case msg: UserListeningOnly                      => handleUserListeningOnly(msg)
	    case msg: NewPermissionsSetting                  => handleNewPermissionsSetting(msg)
	    case msg: MeetingMuted                           => handleMeetingMuted(msg)
	    case msg: MeetingState                           => handleMeetingState(msg)
	    
	    case _ => // println("Unhandled message in UsersClientMessageSender")
	  }
	}
	
	private def buildPermissionsHashMap(perms: Permissions):java.util.HashMap[String, java.lang.Boolean] = {
	  val args = new java.util.HashMap[String, java.lang.Boolean]();  
	  args.put("disableCam", perms.disableCam:java.lang.Boolean);
	  args.put("disableMic", perms.disableMic:java.lang.Boolean);
	  args.put("disablePrivChat", perms.disablePrivChat:java.lang.Boolean);
	  args.put("disablePubChat", perms.disablePubChat:java.lang.Boolean);
    args.put("lockedLayout", perms.lockedLayout:java.lang.Boolean);
    args
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
	  wuser.put("webcamStream", user.webcamStream)
	  wuser.put("phoneUser", user.phoneUser:java.lang.Boolean)
	  wuser.put("voiceUser", vuser)	  
	  wuser.put("listenOnly", user.listenOnly:java.lang.Boolean)
	  
	  val permissions = new HashMap[String, Object]()
	  permissions.put("disableCam", user.permissions.disableCam:java.lang.Boolean)
	  permissions.put("disableMic", user.permissions.disableMic:java.lang.Boolean)
	  permissions.put("disablePrivChat", user.permissions.disablePrivChat:java.lang.Boolean)
	  permissions.put("disablePubChat", user.permissions.disablePubChat:java.lang.Boolean)	  
	  permissions.put("lockedLayout", user.permissions.lockedLayout:java.lang.Boolean)
	  
      wuser.put("permissions", permissions)
  
	  wuser
	}
	
	private def handleNewPermissionsSetting(msg: NewPermissionsSetting) {
	  val args = new java.util.HashMap[String, Object]();  
	  args.put("disableCam", msg.permissions.disableCam:java.lang.Boolean);
	  args.put("disableMic", msg.permissions.disableMic:java.lang.Boolean);
	  args.put("disablePrivChat", msg.permissions.disablePrivChat:java.lang.Boolean);
	  args.put("disablePubChat", msg.permissions.disablePubChat:java.lang.Boolean);
    args.put("lockedLayout", msg.permissions.lockedLayout:java.lang.Boolean);
    
	  var users = new ArrayList[java.util.HashMap[String, Object]];
      msg.applyTo.foreach(uvo => {		
        users.add(buildUserHashMap(uvo))
      })
		
      args.put("users", users);
      
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	  message.put("msg", gson.toJson(args))
  	  
//  	  println("UsersClientMessageSender - handleNewPermissionsSetting \n" + message.get("msg") + "\n")
      val m = new BroadcastClientMessage(msg.meetingID, "permissionsSettingsChanged", message);
	  service.sendMessage(m);	    
	}
	
	private def handleRegisteredUser(msg: UserRegistered) {
	  val args = new java.util.HashMap[String, Object]();  
	  args.put("userId", msg.user.id);

	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	  
 // 	  println("UsersClientMessageSender - handleRegisteredUser \n" + message.get("msg") + "\n")
	}
	
	private def handleValidateAuthTokenReply(msg: ValidateAuthTokenReply) {
	  val args = new java.util.HashMap[String, Object]();  
	  args.put("userId", msg.requesterId);
	  args.put("valid", msg.valid:java.lang.Boolean);	    
	  
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	  message.put("msg", gson.toJson(args))
  	  
//  	  println("UsersClientMessageSender - handleValidateAuthTokenReply \n" + message.get("msg") + "\n")
  	  val m = new DirectClientMessage(msg.meetingID, msg.requesterId, "validateAuthTokenReply", message);
	  service.sendMessage(m);	    
	}
	
	private def handleGetRecordingStatusReply(msg: GetRecordingStatusReply) {
	  val args = new java.util.HashMap[String, Object]();  
	  args.put("userId", msg.userId);
	  args.put("recording", msg.recording:java.lang.Boolean);	    
	  
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	  message.put("msg", gson.toJson(args))
  	  
//  	  println("UsersClientMessageSender - handleGetRecordingStatusReply \n" + message.get("msg") + "\n")
      val m = new DirectClientMessage(msg.meetingID, msg.userId, "getRecordingStatusReply", message);
	  service.sendMessage(m);	  
	}
	
	private def handleRecordingStatusChanged(msg: RecordingStatusChanged) {
	  val args = new java.util.HashMap[String, Object]();  
	  args.put("userId", msg.userId);
	  args.put("recording", msg.recording:java.lang.Boolean);	    
	  
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	  
//  	  println("UsersClientMessageSender - handleRecordingStatusChanged \n" + message.get("msg") + "\n")
      val m = new BroadcastClientMessage(msg.meetingID, "recordingStatusChanged", message);
	  service.sendMessage(m);	
	}
	
	private def handleUserVoiceMuted(msg: UserVoiceMuted) {
	  val args = new java.util.HashMap[String, Object]();
	  args.put("meetingID", msg.meetingID);	  
	  args.put("userId", msg.user.userID);
	  args.put("voiceUserId", msg.user.voiceUser.userId);
	  args.put("muted", msg.user.voiceUser.muted:java.lang.Boolean);
	  
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	  message.put("msg", gson.toJson(args))
  	
//  	  println("UsersClientMessageSender - handleUserVoiceMuted \n" + message.get("msg") + "\n")
//  	log.debug("UsersClientMessageSender - handlePresentationConversionProgress \n" + message.get("msg") + "\n")
      val m = new BroadcastClientMessage(msg.meetingID, "voiceUserMuted", message);
	  service.sendMessage(m);		  
	}
	
	private def handleUserVoiceTalking(msg: UserVoiceTalking) {
	  val args = new java.util.HashMap[String, Object]();
	  args.put("meetingID", msg.meetingID);	  
	  args.put("userId", msg.user.userID);
	  args.put("voiceUserId", msg.user.voiceUser.userId);
	  args.put("talking", msg.user.voiceUser.talking:java.lang.Boolean);
	  
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	  message.put("msg", gson.toJson(args))
  	
 // 	  println("UsersClientMessageSender - handleUserVoiceTalking \n" + message.get("msg") + "\n")
//  	log.debug("UsersClientMessageSender - handlePresentationConversionProgress \n" + message.get("msg") + "\n")
      val m = new BroadcastClientMessage(msg.meetingID, "voiceUserTalking", message);
	  service.sendMessage(m);	  
	}
	
	private def handleUserLeftVoice(msg: UserLeftVoice) {
	  val args = new java.util.HashMap[String, Object]();
	  args.put("meetingID", msg.meetingID);
	  args.put("user", buildUserHashMap(msg.user))
	
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	
//  	  println("UsersClientMessageSender - handleUserLeftVoice \n" + message.get("msg") + "\n")
//  	log.debug("UsersClientMessageSender - handleUserLeftVoice \n" + message.get("msg") + "\n")
      val m = new BroadcastClientMessage(msg.meetingID, "userLeftVoice", message);
	  service.sendMessage(m);	  
	}
	
	private def handleUserJoinedVoice(msg: UserJoinedVoice) {
	  val args = new java.util.HashMap[String, Object]();
	  args.put("meetingID", msg.meetingID);
	  args.put("user", buildUserHashMap(msg.user))
	
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	  message.put("msg", gson.toJson(args))
  	
//  	  println("UsersClientMessageSender - handleUserJoinedVoice \n" + message.get("msg") + "\n")
//  	log.debug("UsersClientMessageSender - handlePresentationConversionProgress \n" + message.get("msg") + "\n")
      val m = new BroadcastClientMessage(msg.meetingID, "userJoinedVoice", message);
	  service.sendMessage(m);		
	}
	
	private def handleGetUsersReply(msg: GetUsersReply):Unit = {
      var args = new HashMap[String, Object]();			
      args.put("count", msg.users.length:java.lang.Integer)
		
      var users = new ArrayList[java.util.HashMap[String, Object]];
      msg.users.foreach(uvo => {		
        users.add(buildUserHashMap(uvo))
      })
		
      args.put("users", users);
		
      val message = new java.util.HashMap[String, Object]() 
      val gson = new Gson()
  	  message.put("msg", gson.toJson(args))
		
//      println("UsersClientMessageSender - handleGetUsersReply \n" + message.get("msg") + "\n")
			
      var m = new DirectClientMessage(msg.meetingID, msg.requesterID, "getUsersReply", message)
  	  service.sendMessage(m)
	}

	private def handleMeetingHasEnded(msg: MeetingHasEnded):Unit = {
	  var args = new HashMap[String, Object]();	
	  args.put("status", "Meeting has already ended.");
		
	  var message = new HashMap[String, Object]();
	  val gson = new Gson();
  	  message.put("msg", gson.toJson(args))
	  
//	  println("UsersClientMessageSender - handleMeetingHasEnded \n" + message.get("msg") + "\n")
	  
	  var m = new DirectClientMessage(msg.meetingID, msg.userId, "meetingHasEnded", message)
	  service.sendMessage(m);
	}
	
	private def handleDisconnectUser(msg: DisconnectUser) {
//	  println("UsersClientMessageSender - handleDisconnectUser mid=[" + msg.meetingID + "], uid=[" + msg.userId + "]\n")
	  
	  var m = new DisconnectClientMessage(msg.meetingID, msg.userId)
	  service.sendMessage(m);	  
	}
	
	private def handleMeetingState(msg: MeetingState) {
	  var args = new HashMap[String, Object]();	
	  args.put("permissions", buildPermissionsHashMap(msg.permissions));
		args.put("meetingMuted", msg.meetingMuted:java.lang.Boolean);
		
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	message.put("msg", gson.toJson(args))

  	var jmr = new DirectClientMessage(msg.meetingID, msg.userId, "meetingState", message);
  	service.sendMessage(jmr);	  
	}
	
	private def handleMeetingMuted(msg: MeetingMuted) {
	  var args = new HashMap[String, Object]();	
	  args.put("meetingMuted", msg.meetingMuted:java.lang.Boolean);
		
	  var message = new HashMap[String, Object]();
	  val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	    
	  var m = new BroadcastClientMessage(msg.meetingID, "meetingMuted", message);
	  service.sendMessage(m);	  
	}
	
	
	private def handleMeetingEnded(msg: MeetingEnded):Unit = {
	  var args = new HashMap[String, Object]();	
	  args.put("status", "Meeting has been ended.");
		
	  var message = new HashMap[String, Object]();
	  val gson = new Gson();
  	  message.put("msg", gson.toJson(args))
  	    
//	  println("UsersClientMessageSender - handleMeetingEnded \n" + msg.meetingID + "\n")
	  
	  var m = new BroadcastClientMessage(msg.meetingID, "meetingEnded", message);
	  service.sendMessage(m);
	}
	
	private def handleDisconnectAllUsers(msg: DisconnectAllUsers) {
	  var dm = new DisconnectAllClientsMessage(msg.meetingID)
	  service.sendMessage(dm)	  
	}

	private def handleAssignPresenter(msg:PresenterAssigned):Unit = {
	  var args = new HashMap[String, Object]();	
	  args.put("newPresenterID", msg.presenter.presenterID);
	  args.put("newPresenterName", msg.presenter.presenterName);
	  args.put("assignedBy", msg.presenter.assignedBy);
		
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	message.put("msg", gson.toJson(args))
		
//  	  println("UsersClientMessageSender - handleAssignPresenter \n" + message.get("msg") + "\n")
  	    
	  var m = new BroadcastClientMessage(msg.meetingID, "assignPresenterCallback", message);
	  service.sendMessage(m);		
	}
	
	private def handleUserJoined(msg: UserJoined):Unit = {
	  var args = new HashMap[String, Object]();	
	  args.put("user", buildUserHashMap(msg.user));
		
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	message.put("msg", gson.toJson(args))

//  println("UsersClientMessageSender - joinMeetingReply \n" + message.get("msg") + "\n")
			
  	var jmr = new DirectClientMessage(msg.meetingID, msg.user.userID, "joinMeetingReply", message);
  	service.sendMessage(jmr);
  	  
//  println("UsersClientMessageSender - handleUserJoined \n" + message.get("msg") + "\n")
  	    
  	var m = new BroadcastClientMessage(msg.meetingID, "participantJoined", message);
  	service.sendMessage(m);
	}

	
	
	private def handleUserLeft(msg: UserLeft):Unit = {
	  var args = new HashMap[String, Object]();	
	  args.put("user", buildUserHashMap(msg.user));
		
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	  message.put("msg", gson.toJson(args))
  	    
//		println("UsersClientMessageSender - handleUserLeft \n" + message.get("msg") + "\n")
		
  	  var m = new BroadcastClientMessage(msg.meetingID, "participantLeft", message);
  	  service.sendMessage(m);
	}

    def handleUserRaisedHand(msg: UserRaisedHand) {
	  	var args = new HashMap[String, Object]()	
		args.put("userId", msg.userID)
		
	    val message = new java.util.HashMap[String, Object]() 
	    val gson = new Gson();
  	    message.put("msg", gson.toJson(args))
  	    
//		println("UsersClientMessageSender - handleUserRaisedHand \n" + message.get("msg") + "\n")
		
		var m = new BroadcastClientMessage(msg.meetingID, "userRaisedHand", message);
		service.sendMessage(m);      
    }

    def handleUserLoweredHand(msg: UserLoweredHand) {
	  	var args = new HashMap[String, Object]();	
		args.put("userId", msg.userID)
		args.put("loweredBy", msg.loweredBy)
		
	    val message = new java.util.HashMap[String, Object]() 
	    val gson = new Gson();
  	    message.put("msg", gson.toJson(args))
  	    
//		println("UsersClientMessageSender - handleUserLoweredHand \n" + message.get("msg") + "\n")
		
		var m = new BroadcastClientMessage(msg.meetingID, "userLoweredHand", message);
		service.sendMessage(m);      
    }

	def handleUserSharedWebcam(msg: UserSharedWebcam) {
	  	var args = new HashMap[String, Object]()	
		args.put("userId", msg.userID)
		args.put("webcamStream", msg.stream)
		
	    val message = new java.util.HashMap[String, Object]() 
	    val gson = new Gson();
  	    message.put("msg", gson.toJson(args))
  	    
//		println("UsersClientMessageSender - handleUserSharedWebcam \n" + message.get("msg") + "\n")
		
		var m = new BroadcastClientMessage(msg.meetingID, "userSharedWebcam", message);
		service.sendMessage(m);	  
	}

	def handleUserUnshareWebcam(msg: UserUnsharedWebcam) {
	  	var args = new HashMap[String, Object]()	
		args.put("userId", msg.userID)
		
	    val message = new java.util.HashMap[String, Object]() 
	    val gson = new Gson();
  	    message.put("msg", gson.toJson(args))
  	    
//		println("UsersClientMessageSender - handleUserUnshareWebcam \n" + message.get("msg") + "\n")
		
		var m = new BroadcastClientMessage(msg.meetingID, "userUnsharedWebcam", message);
		service.sendMessage(m);	  
	}
	                
	private def handleUserStatusChange(msg: UserStatusChange):Unit = {
	  var args = new HashMap[String, Object]();	
		args.put("userID", msg.userID);
		args.put("status", msg.status);
		args.put("value", msg.value);
		
	    val message = new java.util.HashMap[String, Object]() 
	    val gson = new Gson();
  	    message.put("msg", gson.toJson(args))
  	    
//  	    println("UsersClientMessageSender - handleUserStatusChange \n" + message.get("msg") + "\n")
  	    
		var m = new BroadcastClientMessage(msg.meetingID, "participantStatusChange", message);
		service.sendMessage(m);
	}
	
	private def handleUserListeningOnly(msg: UserListeningOnly) {
	  var args = new HashMap[String, Object]();	
	  args.put("userId", msg.userID);
	  args.put("listenOnly", msg.listenOnly:java.lang.Boolean);
	
	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
 	  message.put("msg", gson.toJson(args))
  	    
//    println("UsersClientMessageSender - handleUserListeningOnly \n" + message.get("msg") + "\n")
  	    
 	  var m = new BroadcastClientMessage(msg.meetingID, "user_listening_only", message);
 	  service.sendMessage(m);	  
	}
}