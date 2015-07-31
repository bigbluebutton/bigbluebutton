package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import scala.collection.mutable.HashMap
import java.util.ArrayList
import org.bigbluebutton.core.MeetingActor
import scala.collection.mutable.ArrayBuffer
import scala.collection.immutable.ListSet
import org.bigbluebutton.core.OutMessageGateway

trait UsersApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def hasUser(userID: String): Boolean = {
    usersModel.hasUser(userID)
  }

  def getUser(userID: String): Option[UserVO] = {
    usersModel.getUser(userID)
  }

  def handleUserConnectedToGlobalAudio(msg: UserConnectedToGlobalAudio) {
    val user = usersModel.getUserWithExternalId(msg.userid)
    user foreach { u =>
      val vu = u.voiceUser.copy(talking = false)
      val uvo = u.copy(listenOnly = true, voiceUser = vu)
      usersModel.addUser(uvo)
      log.info("UserConnectedToGlobalAudio: mid=[" + mProps.meetingID + "] uid=[" + uvo.userID + "]")
      outGW.send(new UserListeningOnly(mProps.meetingID, mProps.recorded, uvo.userID, uvo.listenOnly))
    }
  }

  def handleUserDisconnectedFromGlobalAudio(msg: UserDisconnectedFromGlobalAudio) {
    val user = usersModel.getUserWithExternalId(msg.userid)
    user foreach { u =>
      val uvo = u.copy(listenOnly = false)
      usersModel.addUser(uvo)
      log.info("UserDisconnectedToGlobalAudio: mid=[" + mProps.meetingID + "] uid=[" + uvo.userID + "]")
      outGW.send(new UserListeningOnly(mProps.meetingID, mProps.recorded, uvo.userID, uvo.listenOnly))
    }
  }

  def handleMuteAllExceptPresenterRequest(msg: MuteAllExceptPresenterRequest) {
    if (msg.mute) {
      meetingModel.muteMeeting()
    } else {
      meetingModel.unmuteMeeting()
    }
    outGW.send(new MeetingMuted(mProps.meetingID, mProps.recorded, meetingModel.isMeetingMuted()))

    usersWhoAreNotPresenter foreach { u =>
      outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded, msg.requesterID, u.userID, mProps.voiceBridge, u.voiceUser.userId, msg.mute))
    }
  }

  def handleMuteMeetingRequest(msg: MuteMeetingRequest) {
    if (msg.mute) {
      meetingModel.muteMeeting()
    } else {
      meetingModel.unmuteMeeting()
    }
    outGW.send(new MeetingMuted(mProps.meetingID, mProps.recorded, meetingModel.isMeetingMuted()))
    usersModel.getUsers foreach { u =>
      outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded, msg.requesterID, u.userID, mProps.voiceBridge, u.voiceUser.userId, msg.mute))
    }
  }

  def handleValidateAuthToken(msg: ValidateAuthToken) {
    //    println("*************** Got ValidateAuthToken message ********************" )
    usersModel.getRegisteredUserWithToken(msg.token) match {
      case Some(u) =>
        {
          val replyTo = mProps.meetingID + '/' + msg.userId

          //send the reply
          outGW.send(new ValidateAuthTokenReply(mProps.meetingID, msg.userId, msg.token, true, msg.correlationId))

          //join the user
          handleUserJoin(new UserJoining(mProps.meetingID, msg.userId, msg.token))

          //send the presentation
          log.info("ValidateToken success: mid=[" + mProps.meetingID + "] uid=[" + msg.userId + "]")
        }
      case None => {
        log.info("ValidateToken failed: mid=[" + mProps.meetingID + "] uid=[" + msg.userId + "]")
        outGW.send(new ValidateAuthTokenReply(mProps.meetingID, msg.userId, msg.token, false, msg.correlationId))
      }
    }

    /**
     * Send a reply to BigBlueButtonActor to let it know this MeetingActor hasn't hung!
     * Sometimes, the actor seems to hang and doesn't anymore accept messages. This is a simple
     * audit to check whether the actor is still alive. (ralam feb 25, 2015)
     */
    sender ! new ValidateAuthTokenReply(mProps.meetingID, msg.userId, msg.token, false, msg.correlationId)
  }

  def handleRegisterUser(msg: RegisterUser) {
    if (meetingModel.hasMeetingEnded()) {
      // Check first if the meeting has ended and the user refreshed the client to re-connect.
      log.info("Register user failed: reason=[meeting has ended] mid=[" + mProps.meetingID + "] uid=[" + msg.userID + "]")
      sendMeetingHasEnded(msg.userID)
    } else {
      val regUser = new RegisteredUser(msg.userID, msg.extUserID, msg.name, msg.role, msg.authToken)
      usersModel.addRegisteredUser(msg.authToken, regUser)

      log.info("Register user success: mid=[" + mProps.meetingID + "] uid=[" + msg.userID + "]")
      outGW.send(new UserRegistered(mProps.meetingID, mProps.recorded, regUser))
    }

  }

  def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
    outGW.send(new IsMeetingMutedReply(mProps.meetingID, mProps.recorded, msg.requesterID, meetingModel.isMeetingMuted()))
  }

  def handleMuteUserRequest(msg: MuteUserRequest) {
    //    println("Received mute user request uid=[" + msg.userID + "] mute=[" + msg.mute + "]")
    usersModel.getUser(msg.userID) match {
      case Some(u) => {
        //        println("Sending mute user request uid=[" + msg.userID + "] mute=[" + msg.mute + "]")
        log.info("Muting user:  mid=[" + mProps.meetingID + "] uid=[" + u.userID + "]")
        outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded, msg.requesterID, u.userID, mProps.voiceBridge, u.voiceUser.userId, msg.mute))
      }
      case None => {
        log.info("Could not find user to mute:  mid=[" + mProps.meetingID + "] uid=[" + msg.userID + "]")
        //        println("Could not find user to mute. uid=[" + msg.userID + "] mute=[" + msg.mute + "]")
      }
    }
  }

  def handleEjectUserRequest(msg: EjectUserFromVoiceRequest) {
    //    println("Received eject user request uid=[" + msg.userID + "]")
    usersModel.getUser(msg.userId) match {
      case Some(u) => {
        if (u.voiceUser.joined) {
          log.info("Ejecting user from voice:  mid=[" + mProps.meetingID + "] uid=[" + u.userID + "]")
          outGW.send(new EjectVoiceUser(mProps.meetingID, mProps.recorded, msg.ejectedBy, u.userID, mProps.voiceBridge, u.voiceUser.userId))
        }
      }
      case None => // do nothing
    }
  }

  def handleGetLockSettings(msg: GetLockSettings) {
    //println("*************** Reply with current lock settings ********************")

    //reusing the existing handle for NewPermissionsSettings to reply to the GetLockSettings request
    outGW.send(new NewPermissionsSetting(mProps.meetingID, msg.userId, meetingModel.getPermissions(), usersModel.getUsers))
  }

  def handleSetLockSettings(msg: SetLockSettings) {
    //    println("*************** Received new lock settings ********************")
    if (!permissionsEqual(msg.settings)) {
      newPermissions(msg.settings)
      outGW.send(new NewPermissionsSetting(mProps.meetingID, msg.setByUser, meetingModel.getPermissions, usersModel.getUsers))

      handleLockLayout(msg.settings.lockedLayout, msg.setByUser)
    }
  }

  def handleLockUserRequest(msg: LockUserRequest) {
    usersModel.getUser(msg.userID) match {
      case Some(u) => {
        val uvo = u.copy(locked = msg.lock)
        usersModel.addUser(uvo)

        log.info("Lock user:  mid=[" + mProps.meetingID + "] uid=[" + u.userID + "] lock=[" + msg.lock + "]")
        outGW.send(new UserLocked(mProps.meetingID, u.userID, msg.lock))
      }
      case None => {
        log.info("Could not find user to lock:  mid=[" + mProps.meetingID + "] uid=[" + msg.userID + "] lock=[" + msg.lock + "]")
      }
    }
  }

  def handleInitLockSettings(msg: InitLockSettings) {
    if (!meetingModel.permisionsInitialized()) {
      meetingModel.initializePermissions()
      newPermissions(msg.settings)
      outGW.send(new PermissionsSettingInitialized(msg.meetingID, msg.settings, usersModel.getUsers))
    }
  }

  def handleInitAudioSettings(msg: InitAudioSettings) {
    if (!meetingModel.audioSettingsInitialized()) {
      meetingModel.initializeAudioSettings()

      if (meetingModel.isMeetingMuted() != msg.muted) {
        handleMuteAllExceptPresenterRequest(new MuteAllExceptPresenterRequest(mProps.meetingID, msg.requesterID, msg.muted));
      }
    }
  }

  def usersWhoAreNotPresenter(): Array[UserVO] = {
    val au = ArrayBuffer[UserVO]()

    usersModel.getUsers foreach { u =>
      if (!u.presenter) {
        au += u
      }
    }
    au.toArray
  }

  def handleUserRaiseHand(msg: UserRaiseHand) {
    usersModel.getUser(msg.userId) foreach { user =>
      val uvo = user.copy(raiseHand = true)
      usersModel.addUser(uvo)
      outGW.send(new UserRaisedHand(mProps.meetingID, mProps.recorded, uvo.raiseHand, uvo.userID))
    }
  }

  def handleUserLowerHand(msg: UserLowerHand) {
    usersModel.getUser(msg.userId) foreach { user =>
      val uvo = user.copy(raiseHand = false)
      usersModel.addUser(uvo)
      outGW.send(new UserLoweredHand(mProps.meetingID, mProps.recorded, uvo.raiseHand, uvo.userID, msg.loweredBy))
    }
  }

  def handleEjectUserFromMeeting(msg: EjectUserFromMeeting) {
    usersModel.getUser(msg.userId) foreach { user =>
      if (user.voiceUser.joined) {
        outGW.send(new EjectVoiceUser(mProps.meetingID, mProps.recorded, msg.ejectedBy, msg.userId, mProps.voiceBridge, user.voiceUser.userId))
      }

      usersModel.removeUser(msg.userId)
      usersModel.removeRegUser(msg.userId)

      log.info("Ejecting user from meeting:  mid=[" + mProps.meetingID + "]uid=[" + msg.userId + "]")
      outGW.send(new UserEjectedFromMeeting(mProps.meetingID, mProps.recorded, msg.userId, msg.ejectedBy))
      outGW.send(new DisconnectUser(mProps.meetingID, msg.userId))

      outGW.send(new UserLeft(msg.meetingID, mProps.recorded, user))
    }
  }

  def handleUserShareWebcam(msg: UserShareWebcam) {
    usersModel.getUser(msg.userId) foreach { user =>
      val streams = user.webcamStreams + msg.stream
      val uvo = user.copy(hasStream = true, webcamStreams = streams)
      usersModel.addUser(uvo)
      log.info("User shared webcam:  mid=[" + mProps.meetingID + "] uid=[" + uvo.userID + "] sharedStream=[" + msg.stream + "] streams=[" + streams + "]")
      outGW.send(new UserSharedWebcam(mProps.meetingID, mProps.recorded, uvo.userID, msg.stream))
    }
  }

  def handleUserunshareWebcam(msg: UserUnshareWebcam) {
    usersModel.getUser(msg.userId) foreach { user =>
      val streamName = user.webcamStreams find (w => w == msg.stream) foreach { streamName =>
        val streams = user.webcamStreams - streamName
        val uvo = user.copy(hasStream = (!streams.isEmpty), webcamStreams = streams)
        usersModel.addUser(uvo)
        log.info("User unshared webcam:  mid=[" + mProps.meetingID + "] uid=[" + uvo.userID + "] unsharedStream=[" + msg.stream + "] streams=[" + streams + "]")
        outGW.send(new UserUnsharedWebcam(mProps.meetingID, mProps.recorded, uvo.userID, msg.stream))
      }

    }
  }

  def handleChangeUserStatus(msg: ChangeUserStatus): Unit = {
    if (usersModel.hasUser(msg.userID)) {
      outGW.send(new UserStatusChange(mProps.meetingID, mProps.recorded, msg.userID, msg.status, msg.value))
    }
  }

  def handleGetUsers(msg: GetUsers): Unit = {
    outGW.send(new GetUsersReply(msg.meetingID, msg.requesterID, usersModel.getUsers))
  }

  def handleUserJoin(msg: UserJoining): Unit = {
    val regUser = usersModel.getRegisteredUserWithToken(msg.authToken)
    regUser foreach { ru =>
      // if there was a phoneUser with the same userID, reuse the VoiceUser value object
      val vu = usersModel.getUser(msg.userID) match {
        case Some(u) => {
          if (u.voiceUser.joined) {
            u.voiceUser.copy()
          } else {
            new VoiceUser(msg.userID, msg.userID, ru.name, ru.name, false, false, false, false)
          }
        }
        case None => {
          new VoiceUser(msg.userID, msg.userID, ru.name, ru.name, false, false, false, false)
        }
      }

      val uvo = new UserVO(msg.userID, ru.externId, ru.name,
        ru.role, raiseHand = false, presenter = false,
        hasStream = false, locked = getInitialLockStatus(ru.role),
        webcamStreams = new ListSet[String](), phoneUser = false, vu, listenOnly = false)

      usersModel.addUser(uvo)

      log.info("User joined meeting:  mid=[" + mProps.meetingID + "] uid=[" + uvo.userID + "] role=["
        + uvo.role + "] locked=[" + uvo.locked + "] permissions.lockOnJoin=[" + meetingModel.getPermissions().lockOnJoin
        + "] permissions.lockOnJoinConfigurable=[" + meetingModel.getPermissions().lockOnJoinConfigurable + "]")
      outGW.send(new UserJoined(mProps.meetingID, mProps.recorded, uvo))

      outGW.send(new MeetingState(mProps.meetingID, mProps.recorded, uvo.userID, meetingModel.getPermissions(), meetingModel.isMeetingMuted()))

      // Become presenter if the only moderator		
      if ((usersModel.numModerators == 1) || (usersModel.noPresenter())) {
        if (ru.role == Role.MODERATOR) {
          assignNewPresenter(msg.userID, ru.name, msg.userID)
        }
      }
      webUserJoined
      startRecordingIfAutoStart()
    }
  }

  def handleUserLeft(msg: UserLeaving): Unit = {
    if (usersModel.hasUser(msg.userID)) {
      val user = usersModel.removeUser(msg.userID)
      user foreach { u =>
        log.info("User left meeting:  mid=[" + mProps.meetingID + "] uid=[" + u.userID + "]")
        outGW.send(new UserLeft(msg.meetingID, mProps.recorded, u))

        if (u.presenter) {
          // Stop poll if one is running as presenter left.
          this.context.self ! StopPollRequest(mProps.meetingID, u.userID)

          /* The current presenter has left the meeting. Find a moderator and make
	       * him presenter. This way, if there is a moderator in the meeting, there
	       * will always be a presenter.
	       */
          val moderator = usersModel.findAModerator()
          moderator.foreach { mod =>
            log.info("Presenter left meeting:  mid=[" + mProps.meetingID + "] uid=[" + u.userID + "]. Making user=[" + mod.userID + "] presenter.")
            assignNewPresenter(mod.userID, mod.name, mod.userID)
          }
        }
        // add VoiceUser again to the list as a phone user since we still didn't get the event from FreeSWITCH
        val vu = u.voiceUser
        if (vu.joined) {
          this.context.self ! (new UserJoinedVoiceConfMessage(mProps.voiceBridge, vu.userId, msg.userID, vu.callerName, vu.callerNum, vu.muted, vu.talking));
        }
      }

      startCheckingIfWeNeedToEndVoiceConf()
      stopAutoStartedRecording()
    }
  }

  def getInitialLockStatus(role: Role.Role): Boolean = {
    meetingModel.getPermissions().lockOnJoin && !role.equals(Role.MODERATOR)
  }

  def handleUserJoinedVoiceFromPhone(msg: UserJoinedVoiceConfMessage) = {
    val user = usersModel.getUserWithVoiceUserId(msg.voiceUserId) match {
      case Some(user) => {
        log.info("Voice user=[" + msg.voiceUserId + "] is already in conf=[" + mProps.voiceBridge + "]. Must be duplicate message.")
      }
      case None => {
        val webUserId = if (msg.userId != msg.callerIdName) {
          msg.userId
        } else {
          // No current web user. This means that the user called in through
          // the phone. We need to generate a new user as we are not able
          // to match with a web user.
          usersModel.generateWebUserId
        }
        val vu = new VoiceUser(msg.voiceUserId, webUserId, msg.callerIdName, msg.callerIdNum,
          true, false, msg.muted, msg.talking)

        val sessionId = "PHONE-" + webUserId;

        val uvo = new UserVO(webUserId, webUserId, msg.callerIdName,
          Role.VIEWER, raiseHand = false, presenter = false,
          hasStream = false, locked = getInitialLockStatus(Role.VIEWER), webcamStreams = new ListSet[String](),
          phoneUser = true, vu, listenOnly = false)

        usersModel.addUser(uvo)
        log.info("New user joined voice for user [" + uvo.name + "] userid=[" + webUserId + "]")
        outGW.send(new UserJoined(mProps.meetingID, mProps.recorded, uvo))

        outGW.send(new UserJoinedVoice(mProps.meetingID, mProps.recorded, mProps.voiceBridge, uvo))
        if (meetingModel.isMeetingMuted())
          outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded, uvo.userID, uvo.userID, mProps.voiceBridge, vu.userId, meetingModel.isMeetingMuted()))

      }
    }
  }

  def startRecordingVoiceConference() {
    if (usersModel.numUsersInVoiceConference == 1 && mProps.recorded) {
      log.info("********** Send START RECORDING [" + mProps.voiceBridge + "]")
      outGW.send(new StartRecordingVoiceConf(mProps.meetingID, mProps.recorded, mProps.voiceBridge))
    }
  }

  def handleUserJoinedVoiceConfMessage(msg: UserJoinedVoiceConfMessage) = {
    log.info("Received user joined voice for user [" + msg.callerIdName + "] userid=[" + msg.userId + "]")

    usersModel.getUserWithExternalId(msg.userId) match {
      case Some(user) => {
        val vu = new VoiceUser(msg.voiceUserId, msg.userId, msg.callerIdName, msg.callerIdNum, true, false, msg.muted, msg.talking)
        val nu = user.copy(voiceUser = vu)
        usersModel.addUser(nu)
        log.info("User joined voice for user [" + nu.name + "] userid=[" + msg.userId + "]")
        outGW.send(new UserJoinedVoice(mProps.meetingID, mProps.recorded, mProps.voiceBridge, nu))

        if (meetingModel.isMeetingMuted()) {
          outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded, nu.userID, nu.userID, mProps.voiceBridge, nu.voiceUser.userId, meetingModel.isMeetingMuted()))
        }

        startRecordingVoiceConference()
      }
      case None => {
        handleUserJoinedVoiceFromPhone(msg)
        startRecordingVoiceConference()
      }
    }
  }

  def stopRecordingVoiceConference() {
    if (usersModel.numUsersInVoiceConference == 0 && mProps.recorded) {
      log.info("********** Send STOP RECORDING [" + mProps.voiceBridge + "]")
      outGW.send(new StopRecordingVoiceConf(mProps.meetingID, mProps.recorded, mProps.voiceBridge, meetingModel.getVoiceRecordingFilename()))
    }
  }

  def handleUserLeftVoiceConfMessage(msg: UserLeftVoiceConfMessage) {
    usersModel.getUserWithVoiceUserId(msg.voiceUserId) foreach { user =>
      val vu = new VoiceUser(user.userID, user.userID, user.name, user.name, false, false, false, false)
      val nu = user.copy(voiceUser = vu)
      usersModel.addUser(nu)

      //      println("Received voice user left =[" + user.name + "] wid=[" + msg.userId + "]" )
      log.info("Received user left voice for user [" + nu.name + "] userid=[" + msg.voiceUserId + "]")
      outGW.send(new UserLeftVoice(mProps.meetingID, mProps.recorded, mProps.voiceBridge, nu))

      if (user.phoneUser) {
        if (usersModel.hasUser(user.userID)) {
          val userLeaving = usersModel.removeUser(user.userID)
          userLeaving foreach (u => outGW.send(new UserLeft(mProps.meetingID, mProps.recorded, u)))
        }
      }

      stopRecordingVoiceConference()
    }
  }

  def handleUserMutedInVoiceConfMessage(msg: UserMutedInVoiceConfMessage) {
    usersModel.getUserWithVoiceUserId(msg.voiceUserId) foreach { user =>
      val talking: Boolean = if (msg.muted) false else user.voiceUser.talking
      val nv = user.voiceUser.copy(muted = msg.muted, talking = talking)
      val nu = user.copy(voiceUser = nv)
      usersModel.addUser(nu)
      //      println("Received voice muted=[" + msg.muted + "] wid=[" + msg.userId + "]" )
      outGW.send(new UserVoiceMuted(mProps.meetingID, mProps.recorded, mProps.voiceBridge, nu))
    }
  }

  def handleUserTalkingInVoiceConfMessage(msg: UserTalkingInVoiceConfMessage) {
    usersModel.getUserWithVoiceUserId(msg.voiceUserId) foreach { user =>
      val nv = user.voiceUser.copy(talking = msg.talking)
      val nu = user.copy(voiceUser = nv)
      usersModel.addUser(nu)
      //      println("Received voice talking=[" + msg.talking + "] wid=[" + msg.userId + "]" )
      outGW.send(new UserVoiceTalking(mProps.meetingID, mProps.recorded, mProps.voiceBridge, nu))
    }
  }

  def handleAssignPresenter(msg: AssignPresenter): Unit = {
    assignNewPresenter(msg.newPresenterID, msg.newPresenterName, msg.assignedBy)
  }

  def assignNewPresenter(newPresenterID: String, newPresenterName: String, assignedBy: String) {
    if (usersModel.hasUser(newPresenterID)) {

      usersModel.getCurrentPresenter match {
        case Some(curPres) => {
          usersModel.unbecomePresenter(curPres.userID)
          outGW.send(new UserStatusChange(mProps.meetingID, mProps.recorded, curPres.userID, "presenter", false: java.lang.Boolean))
        }
        case None => // do nothing
      }

      usersModel.getUser(newPresenterID) match {
        case Some(newPres) => {
          usersModel.becomePresenter(newPres.userID)
          usersModel.setCurrentPresenterInfo(new Presenter(newPresenterID, newPresenterName, assignedBy))
          outGW.send(new PresenterAssigned(mProps.meetingID, mProps.recorded, new Presenter(newPresenterID, newPresenterName, assignedBy)))
          outGW.send(new UserStatusChange(mProps.meetingID, mProps.recorded, newPresenterID, "presenter", true: java.lang.Boolean))
        }
        case None => // do nothing
      }

    }
  }
}
