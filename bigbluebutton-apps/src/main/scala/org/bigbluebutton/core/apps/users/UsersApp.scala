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
    regUsers.get (msg.token) match {
      case Some(u) =>
      {
        val replyTo = meetingID + '/' + msg.userId

        //send the reply
        outGW.send(new ValidateAuthTokenReply(meetingID, msg.userId, msg.token, true, msg.correlationId, msg.sessionId))

        //join the user
        handleUserJoin(new UserJoining(meetingID, msg.userId, msg.token))

        //send the presentation
        logger.info("ValidateToken success: mid=[" + meetingID + "] uid=[" + msg.userId + "]")
      }
      case None => {
        logger.info("ValidateToken failed: mid=[" + meetingID + "] uid=[" + msg.userId + "]")
        outGW.send(new ValidateAuthTokenReply(meetingID, msg.userId, msg.token, false, msg.correlationId))
      }
    }
    
    /**
     * Send a reply to BigBlueButtonActor to let it know this MeetingActor hasn't hung!
     * Sometimes, the actor seems to hang and doesn't anymore accept messages. This is a simple
     * audit to check whether the actor is still alive. (ralam feb 25, 2015)
     */
    reply(new ValidateAuthTokenReply(meetingID, msg.userId, msg.token, false, msg.correlationId))
  }
  
  def handleRegisterUser(msg: RegisterUser) {
    if (hasMeetingEnded) {
      // Check first if the meeting has ended and the user refreshed the client to re-connect.
      logger.info("Register user failed: reason=[meeting has ended] mid=[" + meetingID + "] uid=[" + msg.userID + "]")
      sendMeetingHasEnded(msg.userID)
    } else {
      val regUser = new RegisteredUser(msg.userID, msg.extUserID, msg.name, msg.role, msg.authToken, msg.guest, msg.guest)
      regUsers += msg.authToken -> regUser
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

  def handleGetLockSettings(msg: GetLockSettings) {
    //println("*************** Reply with current lock settings ********************")

    //reusing the existing handle for NewPermissionsSettings to reply to the GetLockSettings request
    outGW.send(new NewPermissionsSetting(meetingID, msg.userId, permissions, users.getUsers))
  }

  def handleSetLockSettings(msg: SetLockSettings) {
//    println("*************** Received new lock settings ********************")
    if (!permissionsEqual(msg.settings)) {
      newPermissions(msg.settings)
      outGW.send(new NewPermissionsSetting(meetingID, msg.setByUser, permissions, users.getUsers))
      
      handleLockLayout(msg.settings.lockedLayout, msg.setByUser)
    }    
  }
  
  def handleLockUserRequest(msg: LockUserRequest) {
    users.getUser(msg.userID) match {
      case Some(u) => {
        val uvo = u.copy(locked=msg.lock)
        users.addUser(uvo)
        
        logger.info("Lock user:  mid=[" + meetingID + "] uid=[" + u.userID + "] lock=[" + msg.lock + "]")
        outGW.send(new UserLocked(meetingID, u.userID, msg.lock))
      }
      case None => {
        logger.info("Could not find user to lock:  mid=[" + meetingID + "] uid=[" + msg.userID + "] lock=[" + msg.lock + "]")
      }
    }
  }
    
  def handleInitLockSettings(msg: InitLockSettings) {
    if (! permissionsInited) {
      permissionsInited = true
      newPermissions(msg.settings)
	    outGW.send(new PermissionsSettingInitialized(msg.meetingID, msg.settings, users.getUsers))
    }
  }
  
  def handleInitAudioSettings(msg: InitAudioSettings) {
    if (! audioSettingsInited) {
      audioSettingsInited = true
      if(meetingMuted != msg.muted) {
        handleMuteAllExceptPresenterRequest(new MuteAllExceptPresenterRequest(meetingID, msg.requesterID, msg.muted));
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
  
  def handleEjectUserFromMeeting(msg: EjectUserFromMeeting) {
    users.getUser(msg.userId) foreach {user =>
      if (user.voiceUser.joined) {
        outGW.send(new EjectVoiceUser(meetingID, recorded, msg.ejectedBy, msg.userId))
      }
      
      users.removeUser(msg.userId)
      removeRegUser(msg.userId)

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
      logger.info("User shared webcam:  mid=[" + meetingID + "] uid=[" + uvo.userID + "] sharedStream=[" + msg.stream + "] streams=[" + streams + "]")
      outGW.send(new UserSharedWebcam(meetingID, recorded, uvo.userID, msg.stream))
    }     
  }

  def handleUserUnshareWebcam(msg: UserUnshareWebcam) {
    users.getUser(msg.userId) foreach {user =>
      val streams = user.webcamStreams - msg.stream
      val uvo = user.copy(hasStream=(!streams.isEmpty), webcamStreams=streams)
      users.addUser(uvo)
      logger.info("User unshared webcam:  mid=[" + meetingID + "] uid=[" + uvo.userID + "] unsharedStream=[" + msg.stream + "] streams=[" + streams + "]")
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
	  outGW.send(new GetUsersReply(msg.meetingID, msg.requesterID, users.getUsers))
  }
  
  def handleUserJoin(msg: UserJoining):Unit = {
    val regUser = regUsers.get(msg.authToken)
    regUser foreach { ru =>
      // if there was a phoneUser with the same userID, reuse the VoiceUser value object
      val vu = users.getUser(msg.userID) match {
        case Some(u) => {
          if (u.voiceUser.joined) {
            u.voiceUser.copy()
          } else {
            new VoiceUser(msg.userID, msg.userID, ru.name, ru.name,  
                false, false, false, false)
          }
        }
        case None => {
          new VoiceUser(msg.userID, msg.userID, ru.name, ru.name,  
              false, false, false, false)
        }
      }
      val waitingForAcceptance = ru.guest && guestPolicy == GuestPolicy.ASK_MODERATOR && ru.waitingForAcceptance
      val uvo = new UserVO(msg.userID, ru.externId, ru.name, 
                  ru.role, ru.guest, waitingForAcceptance=waitingForAcceptance, mood="", presenter=false, 
                  hasStream=false, locked=getInitialLockStatus(ru.role), 
                  webcamStreams=new ListSet[String](), phoneUser=false, vu, listenOnly=false)
  	
      users.addUser(uvo)

      logger.info("User joined meeting:  mid=[" + meetingID + "] uid=[" + uvo.userID + "] role=[" + uvo.role + "] locked=[" + uvo.locked + "] permissions.lockOnJoin=[" + permissions.lockOnJoin + "] permissions.lockOnJoinConfigurable=[" + permissions.lockOnJoinConfigurable + "]")

      if (uvo.guest && guestPolicy == GuestPolicy.ALWAYS_DENY) {
        outGW.send(new GuestAccessDenied(meetingID, recorded, uvo.userID))
      } else {
        outGW.send(new UserJoined(meetingID, recorded, uvo))

        outGW.send(new MeetingState(meetingID, recorded, uvo.userID, permissions, meetingMuted))
        if (!waitingForAcceptance) {
          // Become presenter if the only moderator
          if ((users.numModerators == 1) || (users.noPresenter())) {
            if (ru.role == Role.MODERATOR) {
                assignNewPresenter(msg.userID, ru.name, msg.userID)
            }
          }
        }
        webUserJoined
        startRecordingIfAutoStart()
      }
    }
  }
			
  def handleUserLeft(msg: UserLeaving):Unit = {
	if (users.hasUser(msg.userID)) {
	  val user = users.removeUser(msg.userID)
	  user foreach { u => 
	    logger.info("User left meeting:  mid=[" + meetingID + "] uid=[" + u.userID + "]")
	    outGW.send(new UserLeft(msg.meetingID, recorded, u)) 
	    updateRegUser(u)

	    if (u.presenter) {
	      /* The current presenter has left the meeting. Find a moderator and make
	       * him presenter. This way, if there is a moderator in the meeting, there
	       * will always be a presenter.
	       */
	      val moderator = users.findAModerator()
	      moderator.foreach { mod =>
	        logger.info("Presenter left meeting:  mid=[" + meetingID + "] uid=[" + u.userID + "]. Making user=[" + mod.userID + "] presenter.")
	        assignNewPresenter(mod.userID, mod.name, mod.userID)
	      }
	    }
      
      // add VoiceUser again to the list as a phone user since we still didn't get the event from FreeSWITCH
      if (u.voiceUser.joined) {
        this ! (new VoiceUserJoined(msg.meetingID, u.voiceUser));
      }
	  }
	  
      startCheckingIfWeNeedToEndVoiceConf()
      stopAutoStartedRecording()
	}
  }
  
  def getInitialLockStatus(role: Role.Role):Boolean = {
    permissions.lockOnJoin && !role.equals(Role.MODERATOR)
  }
  
  def handleUserJoinedVoiceFromPhone(msg: VoiceUserJoined) = {
    val user = users.getUserWithVoiceUserId(msg.voiceUser.userId) match {
        case Some(user) => {
          logger.info("Voice user=[" + msg.voiceUser.userId + "] is already in conf=[" + voiceBridge + "]. Must be duplicate message.")
        }
        case None => {
          val webUserId = if (msg.voiceUser.webUserId != null) {
                msg.voiceUser.webUserId
              } else {
              // No current web user. This means that the user called in through
              // the phone. We need to generate a new user as we are not able
              // to match with a web user.
                users.generateWebUserId
              }
          val vu = msg.voiceUser.copy(webUserId=webUserId)
          
          val sessionId = "PHONE-" + webUserId;
          
          val uvo = new UserVO(webUserId, webUserId, msg.voiceUser.callerName, 
		                  Role.VIEWER, guest=false, waitingForAcceptance=false, mood="", presenter=false, 
		                  hasStream=false, locked=getInitialLockStatus(Role.VIEWER), webcamStreams=new ListSet[String](),
		                  phoneUser=true, vu, listenOnly=false)
		  	
		      users.addUser(uvo)
		      logger.info("New user joined voice for user [" + uvo.name + "] userid=[" + msg.voiceUser.webUserId + "]")
		      outGW.send(new UserJoined(meetingID, recorded, uvo, sessionId))
		      
		      outGW.send(new UserJoinedVoice(meetingID, recorded, voiceBridge, uvo))
		      if (meetingMuted)
            outGW.send(new MuteVoiceUser(meetingID, recorded, uvo.userID, uvo.userID, meetingMuted))      
        
        }
    }
  }
  
  def handleVoiceUserJoined(msg: VoiceUserJoined) = {
      val user = users.getUser(msg.voiceUser.webUserId) match {
        case Some(user) => {
          // this is used to restore the mute state on reconnect
          val previouslyMuted = user.voiceUser.muted
          val nu = user.copy(voiceUser=msg.voiceUser)
          users.addUser(nu)
          logger.info("Received user joined voice for user [" + nu.name + "] userid=[" + msg.voiceUser.webUserId + "]" )
          outGW.send(new UserJoinedVoice(meetingID, recorded, voiceBridge, nu))
          
          if (meetingMuted || previouslyMuted)
            outGW.send(new MuteVoiceUser(meetingID, recorded, nu.userID, nu.userID, true))
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
      val talking:Boolean = if (msg.muted) false else user.voiceUser.talking
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

  private def isModerator(userId: String):Boolean = {
    users.getUser(userId) match {
      case Some(user) => return user.role == Role.MODERATOR && !user.waitingForAcceptance
      case None => return false
    }
  }

  def handleRespondToGuest(msg: RespondToGuest) {
    if (isModerator(msg.requesterID)) {
      var usersToAnswer:Array[UserVO] = null;
      if (msg.userId == null) {
        usersToAnswer = users.getUsers.filter(u => u.waitingForAcceptance == true)
      } else {
        usersToAnswer = users.getUsers.filter(u => u.waitingForAcceptance == true && u.userID == msg.userId)
      }
      usersToAnswer foreach {user =>
        println("UsersApp - handleGuestAccessDenied for user [" + user.userID + "]");
        if (msg.response == true) {
          val nu = user.copy(waitingForAcceptance=false)
          users.addUser(nu)
          outGW.send(new UserJoined(meetingID, recorded, nu))
        } else {
          outGW.send(new GuestAccessDenied(meetingID, recorded, user.userID))
        }
      }
    }
  }

  def getRegisteredUser(userID: String): Option[RegisteredUser] = {
    regUsers.values find (ru => userID contains ru.id)
  }

 def updateRegUser(uvo: UserVO) {
    getRegisteredUser(uvo.userID) match {
      case Some(ru) => {
        val regUser = new RegisteredUser(uvo.userID, uvo.externUserID, uvo.name, uvo.role, ru.authToken, uvo.guest, uvo.waitingForAcceptance)
        regUsers -= ru.authToken
        regUsers += ru.authToken -> regUser
      }
      case None =>
    }
  }

  def removeRegUser(userID: String) {
    getRegisteredUser(userID) match {
      case Some(ru) => regUsers -= ru.authToken
      case None =>
    }
  }
}
