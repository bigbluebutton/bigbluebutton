package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

public class UserClientMessageSender {
	/*
	private Map<String, Object> buildPermissionsHashMap(Permissions perms) {
		Map<String, Boolean> args = new HashMap<String, Boolean>();  
		args.put("disableCam", perms.disableCam);
		args.put("disableMic", perms.disableMic);
		args.put("disablePrivChat", perms.disablePrivChat);
		args.put("disablePubChat", perms.disablePubChat);
		args.put("lockedLayout", perms.lockedLayout);
		args.put("lockOnJoin", perms.lockOnJoin);
	    args.put("lockOnJoinConfigurable", perms.lockOnJoinConfigurable);
		return args;
	}
			
	private Map<String, Object> buildUserHashMap(Map<String, Object> msg) {
		Map<String, Object> vuser = new HashMap<String, Object>();
		vuser.put("userId", vu.userId);
		vuser.put("webUserId", vu.webUserId);
		vuser.put("callerName", vu.callerName);
		vuser.put("callerNum", vu.callerNum);
		vuser.put("joined", vu.joined);
		vuser.put("locked", vu.locked);
		vuser.put("muted", vu.muted);
		vuser.put("talking", vu.talking);
			
		Map<String, Object> wuser = new HashMap<String, Object>();
		wuser.put("userId", user.userID);
		wuser.put("externUserID", user.externUserID);
		wuser.put("name", user.name);
		wuser.put("role", user.role.toString());
		wuser.put("raiseHand", user.raiseHand);
		wuser.put("presenter", user.presenter);
		wuser.put("hasStream", user.hasStream);
		wuser.put("locked", user.locked);
		wuser.put("webcamStream", user.webcamStreams mkString("|"));
		wuser.put("phoneUser", user.phoneUser);
		wuser.put("voiceUser", vuser);	  
		wuser.put("listenOnly", user.listenOnly);
		   
		return wuser;
	}
	*/
/*
			private def handleNewPermissionsSetting(msg: NewPermissionsSetting) {
			  val args = new java.util.HashMap[String, Object]();  
			  args.put("disableCam", msg.permissions.disableCam:java.lang.Boolean);
			  args.put("disableMic", msg.permissions.disableMic:java.lang.Boolean);
			  args.put("disablePrivChat", msg.permissions.disablePrivChat:java.lang.Boolean);
			  args.put("disablePubChat", msg.permissions.disablePubChat:java.lang.Boolean);
		    args.put("lockedLayout", msg.permissions.lockedLayout:java.lang.Boolean);
		    args.put("lockOnJoin", msg.permissions.lockOnJoin:java.lang.Boolean);
		    args.put("lockOnJoinConfigurable", msg.permissions.lockOnJoinConfigurable:java.lang.Boolean);
		    
			  var users = new ArrayList[java.util.HashMap[String, Object]];
		      msg.applyTo.foreach(uvo => {		
		        users.add(buildUserHashMap(uvo))
		      })
				
		      args.put("users", users);
		      
			  val message = new java.util.HashMap[String, Object]() 
			  val gson = new Gson();
		  	  message.put("msg", gson.toJson(args))
		  	  
//		  	  println("UsersClientMessageSender - handleNewPermissionsSetting \n" + message.get("msg") + "\n")
		      val m = new BroadcastClientMessage(msg.meetingID, "permissionsSettingsChanged", message);
			  service.sendMessage(m);	    
			}
			
		  private def handleUserLocked(msg: UserLocked) {
		     val args = new java.util.HashMap[String, Object]();
		     args.put("meetingID", msg.meetingID);
		     args.put("user", msg.userId)
		     args.put("lock", msg.lock:java.lang.Boolean)
		     
		     val message = new java.util.HashMap[String, Object]()
		     val gson = new Gson();
		     message.put("msg", gson.toJson(args))
		     
		     val m = new BroadcastClientMessage(msg.meetingID, "userLocked", message);
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
			
		    private def handleValidateAuthTokenTimedOut(msg: ValidateAuthTokenTimedOut) {
		      val args = new java.util.HashMap[String, Object]();  
		      args.put("userId", msg.requesterId);
		      args.put("valid", msg.valid:java.lang.Boolean);       
		      
		      val message = new java.util.HashMap[String, Object]() 
		      val gson = new Gson();
		      message.put("msg", gson.toJson(args))
		      
		      println("UsersClientMessageSender - handleValidateAuthTokenTimedOut \n" + message.get("msg") + "\n")
		      val m = new DirectClientMessage(msg.meetingID, msg.requesterId, "validateAuthTokenTimedOut", message);
		      service.sendMessage(m);       
		    }
		    
			
			
			private def handleValidateAuthTokenReply(msg: ValidateAuthTokenReply) {
			  val args = new java.util.HashMap[String, Object]();  
			  args.put("userId", msg.requesterId);
			  args.put("valid", msg.valid:java.lang.Boolean);	    
			  
			  val message = new java.util.HashMap[String, Object]() 
			  val gson = new Gson();
		  	  message.put("msg", gson.toJson(args))
		  	  
//		  	  println("UsersClientMessageSender - handleValidateAuthTokenReply \n" + message.get("msg") + "\n")
//		  	  val m = new DirectClientMessage(msg.meetingID, msg.requesterId, "validateAuthTokenReply", message);
//			  service.sendMessage(m);	    
			}
			
			private def handleGetRecordingStatusReply(msg: GetRecordingStatusReply) {
			  val args = new java.util.HashMap[String, Object]();  
			  args.put("userId", msg.userId);
			  args.put("recording", msg.recording:java.lang.Boolean);	    
			  
			  val message = new java.util.HashMap[String, Object]() 
			  val gson = new Gson();
		  	  message.put("msg", gson.toJson(args))
		  	  
//		  	  println("UsersClientMessageSender - handleGetRecordingStatusReply \n" + message.get("msg") + "\n")
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
		  	  
//		  	  println("UsersClientMessageSender - handleRecordingStatusChanged \n" + message.get("msg") + "\n")
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
		  	
//		  	  println("UsersClientMessageSender - handleUserVoiceMuted \n" + message.get("msg") + "\n")
//		  	log.debug("UsersClientMessageSender - handlePresentationConversionProgress \n" + message.get("msg") + "\n")
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
//		  	log.debug("UsersClientMessageSender - handlePresentationConversionProgress \n" + message.get("msg") + "\n")
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
		  	
//		  	  println("UsersClientMessageSender - handleUserLeftVoice \n" + message.get("msg") + "\n")
//		  	log.debug("UsersClientMessageSender - handleUserLeftVoice \n" + message.get("msg") + "\n")
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
		  	
//		  	  println("UsersClientMessageSender - handleUserJoinedVoice \n" + message.get("msg") + "\n")
//		  	log.debug("UsersClientMessageSender - handlePresentationConversionProgress \n" + message.get("msg") + "\n")
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
				
//		      println("UsersClientMessageSender - handleGetUsersReply \n" + message.get("msg") + "\n")
					
		      var m = new DirectClientMessage(msg.meetingID, msg.requesterID, "getUsersReply", message)
		  	  service.sendMessage(m)
			}

			private def handleMeetingHasEnded(msg: MeetingHasEnded):Unit = {
			  var args = new HashMap[String, Object]();	
			  args.put("status", "Meeting has already ended.");
				
			  var message = new HashMap[String, Object]();
			  val gson = new Gson();
		  	  message.put("msg", gson.toJson(args))
			  
//			  println("UsersClientMessageSender - handleMeetingHasEnded \n" + message.get("msg") + "\n")
			  
			  var m = new DirectClientMessage(msg.meetingID, msg.userId, "meetingHasEnded", message)
			  service.sendMessage(m);
			}
			
			private def handleDisconnectUser(msg: DisconnectUser) {
//			  println("UsersClientMessageSender - handleDisconnectUser mid=[" + msg.meetingID + "], uid=[" + msg.userId + "]\n")
			  
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
		  	    
//			  println("UsersClientMessageSender - handleMeetingEnded \n" + msg.meetingID + "\n")
			  
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
				
//		  	  println("UsersClientMessageSender - handleAssignPresenter \n" + message.get("msg") + "\n")
		  	    
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
		  	    
//				println("UsersClientMessageSender - handleUserLeft \n" + message.get("msg") + "\n")
				
		  	  var m = new BroadcastClientMessage(msg.meetingID, "participantLeft", message);
		  	  service.sendMessage(m);
			}

		    def handleUserRaisedHand(msg: UserRaisedHand) {
			  	var args = new HashMap[String, Object]()	
				args.put("userId", msg.userID)
				
			    val message = new java.util.HashMap[String, Object]() 
			    val gson = new Gson();
		  	    message.put("msg", gson.toJson(args))
		  	    
//				println("UsersClientMessageSender - handleUserRaisedHand \n" + message.get("msg") + "\n")
				
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
		  	    
//				println("UsersClientMessageSender - handleUserLoweredHand \n" + message.get("msg") + "\n")
				
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
		  	    
//				println("UsersClientMessageSender - handleUserSharedWebcam \n" + message.get("msg") + "\n")
				
				var m = new BroadcastClientMessage(msg.meetingID, "userSharedWebcam", message);
				service.sendMessage(m);	  
			}

			def handleUserUnshareWebcam(msg: UserUnsharedWebcam) {
			  	var args = new HashMap[String, Object]()	
				args.put("userId", msg.userID)
				args.put("webcamStream", msg.stream)
				
			    val message = new java.util.HashMap[String, Object]() 
			    val gson = new Gson();
		  	    message.put("msg", gson.toJson(args))
		  	    
//				println("UsersClientMessageSender - handleUserUnshareWebcam \n" + message.get("msg") + "\n")
				
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
		  	    
//		  	    println("UsersClientMessageSender - handleUserStatusChange \n" + message.get("msg") + "\n")
		  	    
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
		  	    
//		    println("UsersClientMessageSender - handleUserListeningOnly \n" + message.get("msg") + "\n")
		  	    
		 	  var m = new BroadcastClientMessage(msg.meetingID, "user_listening_only", message);
		 	  service.sendMessage(m);	  
			}
*/
}
