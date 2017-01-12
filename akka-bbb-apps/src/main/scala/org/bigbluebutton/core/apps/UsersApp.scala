package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import scala.collection.mutable.HashMap
import java.util.ArrayList
import scala.collection.mutable.ArrayBuffer
import scala.collection.immutable.ListSet
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.LiveMeeting

trait UsersApp {
  this: LiveMeeting =>

  val outGW: OutMessageGateway

  def hasUser(userID: String): Boolean = {
    usersModel.hasUser(userID)
  }

  def getUser(userID: String): Option[UserVO] = {
    usersModel.getUser(userID)
  }

  def handleUserConnectedToGlobalAudio(msg: UserConnectedToGlobalAudio) {
    log.info("Handling UserConnectedToGlobalAudio: meetingId=" + mProps.meetingID + " userId=" + msg.userid)

    val user = usersModel.getUser(msg.userid)
    user foreach { u =>
      if (usersModel.addGlobalAudioConnection(msg.userid)) {
        val vu = u.voiceUser.copy(joined = false, talking = false)
        val uvo = u.copy(listenOnly = true, voiceUser = vu)
        usersModel.addUser(uvo)
        log.info("UserConnectedToGlobalAudio: meetingId=" + mProps.meetingID + " userId=" + uvo.userID + " user=" + uvo)
        outGW.send(new UserListeningOnly(mProps.meetingID, mProps.recorded, uvo.userID, uvo.listenOnly))
      }
    }
  }

  def handleUserDisconnectedFromGlobalAudio(msg: UserDisconnectedFromGlobalAudio) {
    log.info("Handling UserDisconnectedToGlobalAudio: meetingId=" + mProps.meetingID + " userId=" + msg.userid)

    val user = usersModel.getUser(msg.userid)
    user foreach { u =>
      if (usersModel.removeGlobalAudioConnection(msg.userid)) {
        if (!u.joinedWeb) {
          val userLeaving = usersModel.removeUser(u.userID)
          log.info("Not web user. Send user left message. meetingId=" + mProps.meetingID + " userId=" + u.userID + " user=" + u)
          userLeaving foreach (u => outGW.send(new UserLeft(mProps.meetingID, mProps.recorded, u)))
        } else {
          val vu = u.voiceUser.copy(joined = false)
          val uvo = u.copy(listenOnly = false, voiceUser = vu)
          usersModel.addUser(uvo)
          log.info("UserDisconnectedToGlobalAudio: meetingId=" + mProps.meetingID + " userId=" + uvo.userID + " user=" + uvo)
          outGW.send(new UserListeningOnly(mProps.meetingID, mProps.recorded, uvo.userID, uvo.listenOnly))
        }
      }
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
      outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded, msg.requesterID,
        u.userID, mProps.voiceBridge, u.voiceUser.userId, msg.mute))
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
      outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded, msg.requesterID,
        u.userID, mProps.voiceBridge, u.voiceUser.userId, msg.mute))
    }
  }

  def handleValidateAuthToken(msg: ValidateAuthToken) {
    log.info("Got ValidateAuthToken message. meetingId=" + msg.meetingID + " userId=" + msg.userId)
    usersModel.getRegisteredUserWithToken(msg.token) match {
      case Some(u) =>
        {
          val replyTo = mProps.meetingID + '/' + msg.userId

          //send the reply
          outGW.send(new ValidateAuthTokenReply(mProps.meetingID, msg.userId, msg.token, true, msg.correlationId))

          log.info("ValidateToken success. meetingId=" + mProps.meetingID + " userId=" + msg.userId)

          //join the user
          handleUserJoin(new UserJoining(mProps.meetingID, msg.userId, msg.token))

        }
      case None => {
        log.info("ValidateToken failed. meetingId=" + mProps.meetingID + " userId=" + msg.userId)
        outGW.send(new ValidateAuthTokenReply(mProps.meetingID, msg.userId, msg.token, false, msg.correlationId))
      }
    }

    /**
     * Send a reply to BigBlueButtonActor to let it know this MeetingActor hasn't hung!
     * Sometimes, the actor seems to hang and doesn't anymore accept messages. This is a simple
     * audit to check whether the actor is still alive. (ralam feb 25, 2015)
     */
    //sender ! new ValidateAuthTokenReply(mProps.meetingID, msg.userId, msg.token, false, msg.correlationId)
  }

  def handleRegisterUser(msg: RegisterUser) {
    if (meetingModel.hasMeetingEnded()) {
      // Check first if the meeting has ended and the user refreshed the client to re-connect.
      log.info("Register user failed. Mmeeting has ended. meetingId=" + mProps.meetingID + " userId=" + msg.userID)
      sendMeetingHasEnded(msg.userID)
    } else {
      val regUser = new RegisteredUser(msg.userID, msg.extUserID, msg.name, msg.role, msg.authToken, msg.avatarURL)
      usersModel.addRegisteredUser(msg.authToken, regUser)

      log.info("Register user success. meetingId=" + mProps.meetingID + " userId=" + msg.userID + " user=" + regUser)
      outGW.send(new UserRegistered(mProps.meetingID, mProps.recorded, regUser))
    }

  }

  def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
    outGW.send(new IsMeetingMutedReply(mProps.meetingID, mProps.recorded,
      msg.requesterID, meetingModel.isMeetingMuted()))
  }

  def handleMuteUserRequest(msg: MuteUserRequest) {
    log.info("Received mute user request. meetingId=" + mProps.meetingID + " userId=" + msg.userID + " mute=" + msg.mute)
    usersModel.getUser(msg.userID) match {
      case Some(u) => {
        log.info("Send mute user request. meetingId=" + mProps.meetingID + " userId=" + u.userID + " user=" + u)
        outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded,
          msg.requesterID, u.userID, mProps.voiceBridge,
          u.voiceUser.userId, msg.mute))
      }
      case None => {
        log.info("Could not find user to mute.  meetingId=" + mProps.meetingID + " userId=" + msg.userID)
      }
    }
  }

  def handleEjectUserRequest(msg: EjectUserFromVoiceRequest) {
    log.info("Received eject user request. meetingId=" + msg.meetingID + " userId=" + msg.userId)
    usersModel.getUser(msg.userId) match {
      case Some(u) => {
        if (u.voiceUser.joined) {
          log.info("Ejecting user from voice.  meetingId=" + mProps.meetingID + " userId=" + u.userID)
          outGW.send(new EjectVoiceUser(mProps.meetingID, mProps.recorded, msg.ejectedBy, u.userID, mProps.voiceBridge, u.voiceUser.userId))
        }
      }
      case None => // do nothing
    }
  }

  def handleGetLockSettings(msg: GetLockSettings) {
    //println("*************** Reply with current lock settings ********************")

    //reusing the existing handle for NewPermissionsSettings to reply to the GetLockSettings request
    outGW.send(new NewPermissionsSetting(mProps.meetingID, msg.userId,
      meetingModel.getPermissions(), usersModel.getUsers))
  }

  def handleSetLockSettings(msg: SetLockSettings) {
    if (!permissionsEqual(msg.settings)) {
      newPermissions(msg.settings)
      outGW.send(new NewPermissionsSetting(mProps.meetingID, msg.setByUser,
        meetingModel.getPermissions, usersModel.getUsers))

      handleLockLayout(msg.settings.lockedLayout, msg.setByUser)
    }
  }

  def handleLockUserRequest(msg: LockUserRequest) {
    usersModel.getUser(msg.userID) match {
      case Some(u) => {
        val uvo = u.copy(locked = msg.lock)
        usersModel.addUser(uvo)

        log.info("Lock user.  meetingId=" + mProps.meetingID + " userId=" + u.userID + " lock=" + msg.lock)
        outGW.send(new UserLocked(mProps.meetingID, u.userID, msg.lock))
      }
      case None => {
        log.info("Could not find user to lock.  meetingId=" + mProps.meetingID + " userId=" + msg.userID + " lock=" + msg.lock)
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
        handleMuteAllExceptPresenterRequest(
          new MuteAllExceptPresenterRequest(mProps.meetingID,
            msg.requesterID, msg.muted));
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

  def handleUserEmojiStatus(msg: UserEmojiStatus) {
    usersModel.getUser(msg.userId) foreach { user =>
      val uvo = user.copy(emojiStatus = msg.emojiStatus)
      usersModel.addUser(uvo)
      outGW.send(new UserChangedEmojiStatus(mProps.meetingID, mProps.recorded, msg.emojiStatus, uvo.userID))
    }
  }

  def makeSurePresenterIsAssigned(user: UserVO): Unit = {
    if (user.presenter) {
      /* The current presenter has left the meeting. Find a moderator and make
       * him presenter. This way, if there is a moderator in the meeting, there
       * will always be a presenter.
       */
      val moderator = usersModel.findAModerator()
      moderator.foreach { mod =>
        log.info("Presenter left meeting.  meetingId=" + mProps.meetingID + " userId=" + user.userID
          + ". Making user=[" + mod.userID + "] presenter.")
        assignNewPresenter(mod.userID, mod.name, mod.userID)
      }

      if (meetingModel.isBroadcastingRTMP()) {
        // The presenter left during desktop sharing. Stop desktop sharing on FreeSWITCH
        outGW.send(new DeskShareHangUp(mProps.meetingID, mProps.voiceBridge))

        // notify other clients to close their deskshare view
        outGW.send(new DeskShareNotifyViewersRTMP(mProps.meetingID, meetingModel.getRTMPBroadcastingUrl(),
          meetingModel.getDesktopShareVideoWidth(), meetingModel.getDesktopShareVideoHeight(), false))

        // reset meeting info
        meetingModel.resetDesktopSharingParams()
      }
    }
  }

  def handleEjectUserFromMeeting(msg: EjectUserFromMeeting) {
    usersModel.getUser(msg.userId) foreach { user =>
      if (user.voiceUser.joined) {
        outGW.send(new EjectVoiceUser(mProps.meetingID, mProps.recorded,
          msg.ejectedBy, msg.userId, mProps.voiceBridge, user.voiceUser.userId))
      }

      usersModel.removeUser(msg.userId)
      usersModel.removeRegUser(msg.userId)

      makeSurePresenterIsAssigned(user)

      log.info("Ejecting user from meeting.  meetingId=" + mProps.meetingID + " userId=" + msg.userId)
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
      log.info("User shared webcam.  meetingId=" + mProps.meetingID + " userId=" + uvo.userID
        + " stream=" + msg.stream + " streams=" + streams)
      outGW.send(new UserSharedWebcam(mProps.meetingID, mProps.recorded, uvo.userID, msg.stream))
    }
  }

  def handleUserunshareWebcam(msg: UserUnshareWebcam) {
    usersModel.getUser(msg.userId) foreach { user =>
      val streamName = user.webcamStreams find (w => w == msg.stream) foreach { streamName =>
        val streams = user.webcamStreams - streamName
        val uvo = user.copy(hasStream = (!streams.isEmpty), webcamStreams = streams)
        usersModel.addUser(uvo)
        log.info("User unshared webcam.  meetingId=" + mProps.meetingID + " userId=" + uvo.userID
          + " stream=" + msg.stream + " streams=" + streams)
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
    log.debug("Received user joined meeting. metingId=" + mProps.meetingID + " userId=" + msg.userID)

    val regUser = usersModel.getRegisteredUserWithToken(msg.authToken)
    regUser foreach { ru =>
      log.debug("Found registered user. metingId=" + mProps.meetingID + " userId=" + msg.userID + " ru=" + ru)

      val wUser = usersModel.getUser(msg.userID)

      val vu = wUser match {
        case Some(u) => {
          log.debug("Found  user. metingId=" + mProps.meetingID + " userId=" + msg.userID + " user=" + u)
          if (u.voiceUser.joined) {
            /*
             * User is in voice conference. Must mean that the user reconnected with audio
             * still in the voice conference.
             */
            u.voiceUser.copy()
          } else {
            /**
             * User is not joined in voice conference. Initialize user and copy status
             * as user maybe joined listenOnly.
             */
            new VoiceUser(u.voiceUser.userId, msg.userID, ru.name, ru.name,
              joined = false, locked = false, muted = false,
              talking = false, u.avatarURL, listenOnly = u.listenOnly)
          }
        }
        case None => {
          log.debug("User not found. metingId=" + mProps.meetingID + " userId=" + msg.userID)
          /**
           * New user. Initialize voice status.
           */
          new VoiceUser(msg.userID, msg.userID, ru.name, ru.name,
            joined = false, locked = false,
            muted = false, talking = false, ru.avatarURL, listenOnly = false)
        }
      }

      wUser.foreach { w =>
        if (!w.joinedWeb) {
          log.debug("User is in voice only. Mark as user left. metingId=" + mProps.meetingID + " userId=" + msg.userID)
          /**
           * If user is not joined through the web (perhaps reconnecting).
           * Send a user left event to clear up user list of all clients.
           */
          val user = usersModel.removeUser(w.userID)
          outGW.send(new UserLeft(msg.meetingID, mProps.recorded, w))
        }
      }

      /**
       * Initialize the newly joined user copying voice status in case this
       * join is due to a reconnect.
       */
      val uvo = new UserVO(msg.userID, ru.externId, ru.name,
        ru.role, emojiStatus = "none", presenter = false,
        hasStream = false, locked = getInitialLockStatus(ru.role),
        webcamStreams = new ListSet[String](), phoneUser = false, vu,
        listenOnly = vu.listenOnly, avatarURL = vu.avatarURL, joinedWeb = true)

      usersModel.addUser(uvo)

      log.info("User joined meeting. metingId=" + mProps.meetingID + " userId=" + uvo.userID + " user=" + uvo)

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
        log.info("User left meeting. meetingId=" + mProps.meetingID + " userId=" + u.userID + " user=" + u)
        outGW.send(new UserLeft(msg.meetingID, mProps.recorded, u))

        makeSurePresenterIsAssigned(u)

        val vu = u.voiceUser
        if (vu.joined || u.listenOnly) {
          /**
           * The user that left is still in the voice conference. Maybe this user just got disconnected
           * and is reconnecting. Make the user as joined only in the voice conference. If we get a
           * user left voice conference message, then we will remove the user from the users list.
           */
          switchUserToPhoneUser(new UserJoinedVoiceConfMessage(mProps.voiceBridge,
            vu.userId, u.userID, u.externUserID, vu.callerName,
            vu.callerNum, vu.muted, vu.talking, vu.avatarURL, u.listenOnly));
        }

        checkCaptionOwnerLogOut(u.userID)
      }

      startCheckingIfWeNeedToEndVoiceConf()
      stopAutoStartedRecording()
    }
  }

  def getInitialLockStatus(role: Role.Role): Boolean = {
    meetingModel.getPermissions().lockOnJoin && !role.equals(Role.MODERATOR)
  }

  def handleUserJoinedVoiceFromPhone(msg: UserJoinedVoiceConfMessage) = {
    log.info("User joining from phone.  meetingId=" + mProps.meetingID + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    val user = usersModel.getUserWithVoiceUserId(msg.voiceUserId) match {
      case Some(user) => {
        log.info("Voice user=" + msg.voiceUserId + " is already in conf="
          + mProps.voiceBridge + ". Must be duplicate message. meetigId=" + mProps.meetingID)
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

        /**
         * If user is not joined listenOnly then user is joined calling through phone or webrtc.
         */
        val vu = new VoiceUser(msg.voiceUserId, webUserId, msg.callerIdName, msg.callerIdNum,
          joined = !msg.listenOnly, locked = false, muted = msg.muted, talking = msg.talking, msg.avatarURL, listenOnly = msg.listenOnly)

        /**
         * If user is not joined listenOnly then user is joined calling through phone or webrtc.
         * So we call him "phoneUser".
         */
        val uvo = new UserVO(webUserId, msg.externUserId, msg.callerIdName,
          Role.VIEWER, emojiStatus = "none", presenter = false,
          hasStream = false, locked = getInitialLockStatus(Role.VIEWER),
          webcamStreams = new ListSet[String](),
          phoneUser = !msg.listenOnly, vu, listenOnly = msg.listenOnly, avatarURL = msg.avatarURL, joinedWeb = false)

        usersModel.addUser(uvo)

        log.info("User joined from phone.  meetingId=" + mProps.meetingID + " userId=" + uvo.userID + " user=" + uvo)

        outGW.send(new UserJoined(mProps.meetingID, mProps.recorded, uvo))
        outGW.send(new UserJoinedVoice(mProps.meetingID, mProps.recorded, mProps.voiceBridge, uvo))

        if (meetingModel.isMeetingMuted()) {
          outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded, uvo.userID, uvo.userID,
            mProps.voiceBridge, vu.userId, meetingModel.isMeetingMuted()))
        }
      }
    }
  }

  def startRecordingVoiceConference() {
    if (usersModel.numUsersInVoiceConference == 1 && mProps.recorded && !usersModel.isVoiceRecording) {
      usersModel.startRecordingVoice()
      log.info("Send START RECORDING voice conf. meetingId=" + mProps.meetingID + " voice conf=" + mProps.voiceBridge)
      outGW.send(new StartRecordingVoiceConf(mProps.meetingID, mProps.recorded, mProps.voiceBridge))
    }
  }

  def switchUserToPhoneUser(msg: UserJoinedVoiceConfMessage) = {
    log.info("User has been disconnected but still in voice conf. Switching to phone user. meetingId="
      + mProps.meetingID + " callername=" + msg.callerIdName
      + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    usersModel.getUser(msg.userId) match {
      case Some(user) => {
        val vu = new VoiceUser(msg.voiceUserId, msg.userId, msg.callerIdName,
          msg.callerIdNum, joined = true, locked = false,
          msg.muted, msg.talking, msg.avatarURL, msg.listenOnly)
        val nu = user.copy(voiceUser = vu, listenOnly = msg.listenOnly)
        usersModel.addUser(nu)

        log.info("User joined voice. meetingId=" + mProps.meetingID + " userId=" + user.userID + " user=" + nu)
        outGW.send(new UserJoinedVoice(mProps.meetingID, mProps.recorded, mProps.voiceBridge, nu))

        if (meetingModel.isMeetingMuted()) {
          outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded,
            nu.userID, nu.userID, mProps.voiceBridge,
            nu.voiceUser.userId, meetingModel.isMeetingMuted()))
        }
      }
      case None => {
        handleUserJoinedVoiceFromPhone(msg)
      }
    }
  }

  def handleUserJoinedVoiceConfMessage(msg: UserJoinedVoiceConfMessage) = {
    log.info("Received user joined voice. meetingId=" + mProps.meetingID + " callername=" + msg.callerIdName
      + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    usersModel.getUser(msg.userId) match {
      case Some(user) => {
        // this is used to restore the mute state on reconnect
        val previouslyMuted = user.voiceUser.muted

        val vu = new VoiceUser(msg.voiceUserId, msg.userId, msg.callerIdName,
          msg.callerIdNum, joined = true, locked = false,
          msg.muted, msg.talking, msg.avatarURL, msg.listenOnly)
        val nu = user.copy(voiceUser = vu, listenOnly = msg.listenOnly)
        usersModel.addUser(nu)

        log.info("User joined voice. meetingId=" + mProps.meetingID + " userId=" + user.userID + " user=" + nu)
        outGW.send(new UserJoinedVoice(mProps.meetingID, mProps.recorded, mProps.voiceBridge, nu))

        if (meetingModel.isMeetingMuted() || previouslyMuted) {
          outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded,
            nu.userID, nu.userID, mProps.voiceBridge,
            nu.voiceUser.userId, true))
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
    if (usersModel.numUsersInVoiceConference == 0 && mProps.recorded && usersModel.isVoiceRecording) {
      usersModel.stopRecordingVoice()
      log.info("Send STOP RECORDING voice conf. meetingId=" + mProps.meetingID + " voice conf=" + mProps.voiceBridge)
      outGW.send(new StopRecordingVoiceConf(mProps.meetingID, mProps.recorded,
        mProps.voiceBridge, meetingModel.getVoiceRecordingFilename()))
    }
  }

  def handleUserLeftVoiceConfMessage(msg: UserLeftVoiceConfMessage) {
    log.info("Received user left voice conf. meetingId=" + mProps.meetingID + " voice conf=" + msg.voiceConfId
      + " userId=" + msg.voiceUserId)

    usersModel.getUserWithVoiceUserId(msg.voiceUserId) foreach { user =>
      /**
       * Reset user's voice status.
       */
      val vu = new VoiceUser(user.userID, user.userID, user.name, user.name,
        joined = false, locked = false, muted = false, talking = false, user.avatarURL, listenOnly = false)
      val nu = user.copy(voiceUser = vu, phoneUser = false, listenOnly = false)
      usersModel.addUser(nu)

      log.info("User left voice conf. meetingId=" + mProps.meetingID + " userId=" + nu.userID + " user=" + nu)
      outGW.send(new UserLeftVoice(mProps.meetingID, mProps.recorded, mProps.voiceBridge, nu))

      if (user.phoneUser) {
        if (usersModel.hasUser(user.userID)) {
          val userLeaving = usersModel.removeUser(user.userID)
          userLeaving foreach (u => outGW.send(new UserLeft(mProps.meetingID, mProps.recorded, u)))
        }
      }
    }
    stopRecordingVoiceConference()
  }

  def handleUserMutedInVoiceConfMessage(msg: UserMutedInVoiceConfMessage) {
    usersModel.getUserWithVoiceUserId(msg.voiceUserId) foreach { user =>
      val talking: Boolean = if (msg.muted) false else user.voiceUser.talking
      val nv = user.voiceUser.copy(muted = msg.muted, talking = talking)
      val nu = user.copy(voiceUser = nv)
      usersModel.addUser(nu)

      log.info("User muted in voice conf. meetingId=" + mProps.meetingID + " userId=" + nu.userID + " user=" + nu)

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
    // Stop poll if one is running as presenter left.
    handleStopPollRequest(StopPollRequest(mProps.meetingID, assignedBy))

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
