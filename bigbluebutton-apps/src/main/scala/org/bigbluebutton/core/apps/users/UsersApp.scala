package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.api._
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.User
import java.util.ArrayList
import org.bigbluebutton.core.MeetingActor
import scala.collection.mutable.ArrayBuffer
import scala.collection.immutable.ListSet

trait UsersApp {
  this : MeetingActor =>
  
  val outGW: MessageOutGateway
  
  val users = new UsersModel
  private var regUsers = new collection.immutable.HashMap[String, RegisteredUser]
  
  private var locked = false
  private var meetingMuted = false
  
  private var currentPresenter = new Presenter("system", "system", "system")
  
  private var guestsWaiting = new collection.immutable.ListSet[String]
  
  def hasUser(userID: String):Boolean = {
    users.hasUser(userID)
  }
  
  def getUser(userID:String):Option[UserVO] = {
    users.getUser(userID)
  }
  
  def getCurrentPresenter:Presenter = {
    currentPresenter
  }
  
  def handleUserConnectedToGlobalAudio(msg: UserConnectedToGlobalAudio) {
    val user = users.getUserWithExternalId(msg.userid)
    user foreach {u =>
      val vu = u.voiceUser.copy(talking=false)
      val uvo = u.copy(listenOnly=true, voiceUser=vu)
      users.addUser(uvo)
      logger.info("UserConnectedToGlobalAudio: mid=[" + meetingID + "] uid=[" + uvo.userID + "]")
      outGW.send(new UserListeningOnly(meetingID, recorded, uvo.userID, uvo.listenOnly))        
    }
  }
  
  def handleUserDisconnectedFromGlobalAudio(msg: UserDisconnectedFromGlobalAudio) {
    val user = users.getUserWithExternalId(msg.userid)
    user foreach {u =>
      val uvo = u.copy(listenOnly=false)
      users.addUser(uvo)
      logger.info("UserDisconnectedToGlobalAudio: mid=[" + meetingID + "] uid=[" + uvo.userID + "]")
      outGW.send(new UserListeningOnly(meetingID, recorded, uvo.userID, uvo.listenOnly))        
    }
  }
  

  def handleMuteAllExceptPresenterRequest(msg: MuteAllExceptPresenterRequest) {
    meetingMuted = msg.mute
    outGW.send(new MeetingMuted(meetingID, recorded, meetingMuted))
    
    usersWhoAreNotPresenter foreach {u =>
      outGW.send(new MuteVoiceUser(meetingID, recorded, msg.requesterID, u.userID, msg.mute))
    }       
  }
    
  def handleMuteMeetingRequest(msg: MuteMeetingRequest) {
    meetingMuted = msg.mute
    outGW.send(new MeetingMuted(meetingID, recorded, meetingMuted))
    users.getUsers foreach {u =>
        outGW.send(new MuteVoiceUser(meetingID, recorded, msg.requesterID, u.userID, msg.mute)) 
    }
  }
  
  def handleValidateAuthToken(msg: ValidateAuthToken) {
//    println("*************** Got ValidateAuthToken message ********************" )
    regUsers.get (msg.userId) match {
      case Some(u) =>
      {
        val replyTo = meetingID + '/' + msg.userId

        //send the reply
        outGW.send(new ValidateAuthTokenReply(meetingID, msg.userId, msg.token, true, msg.correlationId))

        //send the list of users in the meeting
        outGW.send(new GetUsersReply(meetingID, msg.userId, users.getUsers))

        //send chat history
        this ! (new GetChatHistoryRequest(meetingID, msg.userId, replyTo))

        //join the user
        handleUserJoin(new UserJoining(meetingID, msg.userId))

        //send the presentation
        logger.info("ValidateToken success: mid=[" + meetingID + "] uid=[" + msg.userId + "]")
        this ! (new GetPresentationInfo(meetingID, msg.userId, replyTo))
      }
      case None => {
        logger.info("ValidateToken failed: mid=[" + meetingID + "] uid=[" + msg.userId + "]")
        outGW.send(new ValidateAuthTokenReply(meetingID, msg.userId, msg.token, false, msg.correlationId))
      }
    }
  }
  
  def handleRegisterUser(msg: RegisterUser) {
    if (hasMeetingEnded) {
      // Check first if the meeting has ended and the user refreshed the client to re-connect.
      logger.info("Register user failed: reason=[meeting has ended] mid=[" + meetingID + "] uid=[" + msg.userID + "]")
      sendMeetingHasEnded(msg.userID)
    } else {
      val regUser = new RegisteredUser(msg.userID, msg.extUserID, msg.name, msg.role, msg.authToken, msg.guest)
      regUsers += msg.userID -> regUser
      logger.info("Register user success: mid=[" + meetingID + "] uid=[" + msg.userID + "]")
      outGW.send(new UserRegistered(meetingID, recorded, regUser))      
    }

  }
  
  def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
    outGW.send(new IsMeetingMutedReply(meetingID, recorded, msg.requesterID, meetingMuted))
  }
  
  def handleMuteUserRequest(msg: MuteUserRequest) {
//    println("Received mute user request uid=[" + msg.userID + "] mute=[" + msg.mute + "]")
    users.getUser(msg.userID) match {
      case Some(u) => {
//        println("Sending mute user request uid=[" + msg.userID + "] mute=[" + msg.mute + "]")
        logger.info("Muting user:  mid=[" + meetingID + "] uid=[" + u.userID + "]")
        outGW.send(new MuteVoiceUser(meetingID, recorded, msg.requesterID, u.userID, msg.mute))
      }
      case None => {
        logger.info("Could not find user to mute:  mid=[" + meetingID + "] uid=[" + msg.userID + "]")
//        println("Could not find user to mute. uid=[" + msg.userID + "] mute=[" + msg.mute + "]")
      }
    }
  }
  
  def handleEjectUserRequest(msg: EjectUserFromVoiceRequest) {
//    println("Received eject user request uid=[" + msg.userID + "]")
    users.getUser(msg.userId) match {
      case Some(u) => {
        if (u.voiceUser.joined) {
          logger.info("Ejecting user from voice:  mid=[" + meetingID + "] uid=[" + u.userID + "]")
          outGW.send(new EjectVoiceUser(meetingID, recorded, msg.ejectedBy, u.userID))
        }      
      }
      case None => // do nothing
    }
  }

  def handleLockUser(msg: LockUser) {
    
  }
  
  def handleLockAllUsers(msg: LockAllUsers) {
    
  }
  
  def handleGetLockSettings(msg: GetLockSettings) {
    
  }
  
  def handleIsMeetingLocked(msg: IsMeetingLocked) {
    
  }

  def handleSetLockSettings(msg: SetLockSettings) {
//    println("*************** Received new lock settings ********************")
    if (!permissionsEqual(msg.settings)) {
      newPermissions(msg.settings)
      val au = affectedUsers(msg.settings)
      outGW.send(new NewPermissionsSetting(meetingID, msg.setByUser, permissions, au))
      
      handleLockLayout(msg.settings.lockedLayout, msg.setByUser)
    }    
  }
    
  def handleInitLockSettings(msg: InitLockSettings) {
    if (! permissionsInited) {
      permissionsInited = true
      if (permissions != msg.settings || locked != msg.locked) {
	      permissions = msg.settings   
	      locked = msg.locked	    
	      val au = affectedUsers(msg.settings)
	      outGW.send(new PermissionsSettingInitialized(msg.meetingID, msg.locked, msg.settings, au))
      }      
    }
  }  

  def usersWhoAreNotPresenter():Array[UserVO] = {
    val au = ArrayBuffer[UserVO]()
    
    users.getUsers foreach {u =>
        if (! u.presenter) {
          au += u
        }
    }
    au.toArray    
  }
  
  def affectedUsers(settings: Permissions):Array[UserVO] = {
    val au = ArrayBuffer[UserVO]()
    
    users.getUsers foreach {u =>
      val nu = u.copy(permissions=permissions)
      users.addUser(nu)
        if (! u.presenter && u.role != Role.MODERATOR) {
          au += nu
        }
    }
    au.toArray
  }
  
  def handleEjectUserFromMeeting(msg: EjectUserFromMeeting) {
    users.getUser(msg.userId) foreach {user =>
      if (user.voiceUser.joined) {
        outGW.send(new EjectVoiceUser(meetingID, recorded, msg.ejectedBy, msg.userId))
      }
      
      users.removeUser(msg.userId)
      
      logger.info("Ejecting user from meeting:  mid=[" + meetingID + "]uid=[" + msg.userId + "]")
      outGW.send(new UserEjectedFromMeeting(meetingID, recorded, msg.userId, msg.ejectedBy))
      outGW.send(new DisconnectUser(meetingID, msg.userId))
      
      outGW.send(new UserLeft(msg.meetingID, recorded, user))
    }    
  }

  def handleUserShareWebcam(msg: UserShareWebcam) {
    users.getUser(msg.userId) foreach {user =>
      val streams = user.webcamStreams + msg.stream
      val uvo = user.copy(hasStream=true, webcamStreams=streams)
      users.addUser(uvo)
      logger.info("User shared webcam:  mid=[" + meetingID + "] uid=[" + uvo.userID + "]")
      outGW.send(new UserSharedWebcam(meetingID, recorded, uvo.userID, msg.stream))
    }     
  }

  def handleUserunshareWebcam(msg: UserUnshareWebcam) {
    users.getUser(msg.userId) foreach {user =>
      val streams = user.webcamStreams - msg.stream
      val uvo = user.copy(hasStream=false, webcamStreams=streams)
      users.addUser(uvo)
      logger.info("User unshared webcam:  mid=[" + meetingID + "] uid=[" + uvo.userID + "] streams=[" + streams + "]")
      outGW.send(new UserUnsharedWebcam(meetingID, recorded, uvo.userID, msg.stream))
    }     
  }
	                         
  def handleChangeUserStatus(msg: ChangeUserStatus):Unit = {
    users.getUser(msg.userID) foreach {user =>
      val uvo = msg.status match {
        case "mood" => user.copy( mood=msg.value.asInstanceOf[String])
        case _ => null
      }
      if (uvo != null) {
        logger.info("User changed mood:  mid=[" + meetingID + "] uid=[" + uvo.userID + "] mood=[" + msg.value + "]")
        users.addUser(uvo)
      }
      outGW.send(new UserStatusChange(meetingID, recorded, msg.userID, msg.status, msg.value))
    }
  }
  
  def handleChangeUserRole(msg: ChangeUserRole) {
    users.getUser(msg.userID) foreach {user =>
      val uvo = user.copy(role=msg.role)
      users.addUser(uvo)
      val userRole = if(msg.role == Role.MODERATOR) "MODERATOR" else "VIEWER"
      outGW.send(new UserRoleChange(meetingID, recorded, msg.userID, userRole))
    }
  }

  def handleGetUsers(msg: GetUsers):Unit = {
	  // Filter out guests waiting
	  val approvedUsers = users.getUsers.filter(x => !guestsWaiting.contains(x.userID))
	  outGW.send(new GetUsersReply(msg.meetingID, msg.requesterID, approvedUsers))
  }
  
  def handleUserJoin(msg: UserJoining):Unit = {
    val regUser = regUsers.get(msg.userID)
    regUser foreach { ru =>
      val vu = new VoiceUser(msg.userID, msg.userID, ru.name, ru.name,  
                           false, false, false, false)
      val uvo = new UserVO(msg.userID, ru.externId, ru.name, 
                  ru.role, ru.guest, mood="", presenter=false, 
                  hasStream=false, locked=false, webcamStreams=new ListSet[String](), 
                  phoneUser=false, vu, listenOnly=false, permissions)

      users.addUser(uvo)

      // Send UserJoined only if is not a guest or guest policy is always accept
      // For guests this message will be sent when they are accepted
      if(!ru.guest || guestPolicy == GuestPolicy.ALWAYS_ACCEPT) {
        logger.info("User joined meeting:  mid=[" + meetingID + "] uid=[" + uvo.userID + "]")
        outGW.send(new UserJoined(meetingID, recorded, uvo))

        outGW.send(new MeetingState(meetingID, recorded, uvo.userID, permissions, meetingMuted))

        // Become presenter if the only moderator
        if (users.numModerators == 1) {
          if (ru.role == Role.MODERATOR) {
              assignNewPresenter(msg.userID, ru.name, msg.userID)
          }
        }
      }
      outGW.send(new JoinMeetingReply(meetingID, recorded, uvo))
      webUserJoined
      startRecordingIfAutoStart()
    }
  }
			
  def handleUserLeft(msg: UserLeaving):Unit = {
	 if (users.hasUser(msg.userID)) {
	  guestsWaiting = guestsWaiting - msg.userID
	  val user = users.removeUser(msg.userID)
	  user foreach { u => 
	    logger.info("User left meeting:  mid=[" + meetingID + "] uid=[" + u.userID + "]")
	    outGW.send(new UserLeft(msg.meetingID, recorded, u)) 
	  }
	  
    startCheckingIfWeNeedToEndVoiceConf()
    stopAutoStartedRecording()
	 }
  }
  
  def handleUserJoinedVoiceFromPhone(msg: VoiceUserJoined) = {
      val user = users.getUserWithVoiceUserId(msg.voiceUser.userId) match {
        case Some(user) => {
          logger.info("Voice user=[" + msg.voiceUser.userId + "] is already in conf=[" + voiceBridge + "]. Must be duplicate message.")
        }
        case None => {
          // No current web user. This means that the user called in through
          // the phone. We need to generate a new user as we are not able
          // to match with a web user.
          val webUserId = users.generateWebUserId
          val vu = new VoiceUser(msg.voiceUser.userId, webUserId, 
                                 msg.voiceUser.callerName, msg.voiceUser.callerNum,
                                 true, false, false, false)
          val uvo = new UserVO(webUserId, webUserId, msg.voiceUser.callerName, 
		                  Role.VIEWER, guest=false, mood="", presenter=false, 
		                  hasStream=false, locked=false, webcamStreams=new ListSet[String](), 
		                  phoneUser=true, vu, listenOnly=false, permissions)
		  	
		      users.addUser(uvo)
		      logger.info("New user joined voice for user [" + uvo.name + "] userid=[" + msg.voiceUser.webUserId + "]")
		      outGW.send(new UserJoined(meetingID, recorded, uvo))
		      outGW.send(new JoinMeetingReply(meetingID, recorded, uvo))
		      
		      outGW.send(new UserJoinedVoice(meetingID, recorded, voiceBridge, uvo))
		      if (meetingMuted)
            outGW.send(new MuteVoiceUser(meetingID, recorded, uvo.userID, uvo.userID, meetingMuted))      
        
        }
      }
  }
  
  def handleVoiceUserJoined(msg: VoiceUserJoined) = {
      val user = users.getUser(msg.voiceUser.webUserId) match {
        case Some(user) => {
          val nu = user.copy(voiceUser=msg.voiceUser)
          users.addUser(nu)
          logger.info("Received user joined voice for user [" + nu.name + "] userid=[" + msg.voiceUser.webUserId + "]" )
          outGW.send(new UserJoinedVoice(meetingID, recorded, voiceBridge, nu))
          
          if (meetingMuted)
            outGW.send(new MuteVoiceUser(meetingID, recorded, nu.userID, nu.userID, meetingMuted))
        }
        case None => {
        	handleUserJoinedVoiceFromPhone(msg)
        }
      }
  }
  
  def handleVoiceUserLeft(msg: VoiceUserLeft) {
    users.getUser(msg.userId) foreach {user =>
      val vu = new VoiceUser(user.userID, user.userID, user.name, user.name,  
                           false, false, false, false)
      val nu = user.copy(voiceUser=vu)
      users.addUser(nu)
            
//      println("Received voice user left =[" + user.name + "] wid=[" + msg.userId + "]" )
      logger.info("Received user left voice for user [" + nu.name + "] userid=[" + msg.userId + "]" )
      outGW.send(new UserLeftVoice(meetingID, recorded, voiceBridge, nu))    
      
      if (user.phoneUser) {
	      if (users.hasUser(user.userID)) {
	        val userLeaving = users.removeUser(user.userID)
	        userLeaving foreach (u => outGW.send(new UserLeft(msg.meetingID, recorded, u)))
	      }        
      }
    }    
  }
  
  def handleVoiceUserMuted(msg: VoiceUserMuted) {
    users.getUser(msg.userId) foreach {user =>
      val talking = if (msg.muted) false else user.voiceUser.talking
      val nv = user.voiceUser.copy(muted=msg.muted, talking=talking)
      val nu = user.copy(voiceUser=nv)
      users.addUser(nu)
//      println("Received voice muted=[" + msg.muted + "] wid=[" + msg.userId + "]" )
      outGW.send(new UserVoiceMuted(meetingID, recorded, voiceBridge, nu))        
    }   
  }
  
  def handleVoiceUserTalking(msg: VoiceUserTalking) {
    users.getUser(msg.userId) foreach {user =>
      val nv = user.voiceUser.copy(talking=msg.talking)
      val nu = user.copy(voiceUser=nv)
      users.addUser(nu)
//      println("Received voice talking=[" + msg.talking + "] wid=[" + msg.userId + "]" )
      outGW.send(new UserVoiceTalking(meetingID, recorded, voiceBridge, nu))        
    }     
  }
  
  def handleAssignPresenter(msg: AssignPresenter):Unit = {
	assignNewPresenter(msg.newPresenterID, msg.newPresenterName, msg.assignedBy)
  } 
	
  def assignNewPresenter(newPresenterID:String, newPresenterName: String, assignedBy: String) {
    if (users.hasUser(newPresenterID)) {

      users.getCurrentPresenter match {
        case Some(curPres) => {
  	      users.unbecomePresenter(curPres.userID)  
  	      outGW.send(new UserStatusChange(meetingID, recorded, curPres.userID, "presenter", false:java.lang.Boolean))        
        }
        case None => // do nothing
      }
      
  	  users.getUser(newPresenterID) match {
  	    case Some(newPres) => {
  	      users.becomePresenter(newPres.userID)      	  
  	      currentPresenter = new Presenter(newPresenterID, newPresenterName, assignedBy)
  	      outGW.send(new PresenterAssigned(meetingID, recorded, new Presenter(newPresenterID, newPresenterName, assignedBy)))
          outGW.send(new UserStatusChange(meetingID, recorded, newPresenterID, "presenter", true:java.lang.Boolean))  	      
  	    }
  	    case None => // do nothing
  	  }

    }
  }

  def handleUserRequestToEnter(msg: UserRequestToEnter) {
    users.getUser(msg.userID) match {
      case Some(user) => {
        guestsWaiting = guestsWaiting + msg.userID;
        outGW.send(new GuestRequestedToEnter(meetingID, recorded, msg.userID, user.name))
      }
      case None => {
//      println("handleUserRequestToEnter user [" + msg.userId + "] not found.")
      }
    }
  }

  def handleGetGuestsWaiting(msg: GetGuestsWaiting) {
    if(users.hasUser(msg.requesterID)) {
      var message = "";
      guestsWaiting foreach {guest => {
        users.getUser(guest) match {
          case Some(user) => message = message + user.userID + ":" + user.name + ","
          case None => {}
        }
      }}
      outGW.send(new GetGuestsWaitingReply(meetingID, recorded, msg.requesterID, message))
    }
  }

  def handleRespondToGuest(msg: RespondToGuest) {
    if(guestsWaiting.contains(msg.guestID)) {
      guestsWaiting = guestsWaiting - msg.guestID
      outGW.send(new ResponseToGuest(meetingID, recorded, msg.guestID, msg.response))
      if(msg.response == true) {
        users.getUser(msg.guestID) foreach {user =>
          println("UsersApp - handleResponseToGuest sending userJoined["+user.userID+"]");
          outGW.send(new UserJoined(meetingID, recorded, user))
          outGW.send(new MeetingState(meetingID, recorded, user.userID, permissions, meetingMuted))
        }
      }
    }
  }

  def handleRespondToAllGuests(msg: RespondToAllGuests) {
    guestsWaiting foreach {guest =>
      if(msg.response == true) {
        users.getUser(guest) foreach {user =>
          println("UsersApp - handleResponseToGuest sending userJoined["+user.userID+"]");
          outGW.send(new UserJoined(meetingID, recorded, user))
          outGW.send(new MeetingState(meetingID, recorded, user.userID, permissions, meetingMuted))
        }
      }
      outGW.send(new ResponseToGuest(meetingID, recorded, guest, msg.response))
    }
    guestsWaiting = new collection.immutable.ListSet[String]
  }

  def handleKickGuest(msg: KickGuest) {
    guestsWaiting = guestsWaiting - msg.guestID;
    outGW.send(new GuestKicked(meetingID, recorded, msg.guestID))
  }
}