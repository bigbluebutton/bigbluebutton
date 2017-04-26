package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import scala.collection.immutable.ListSet
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.GuestPolicy
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.MeetingActor

trait UsersApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserConnectedToGlobalAudio(msg: UserConnectedToGlobalAudio) {
    log.info("Handling UserConnectedToGlobalAudio: meetingId=" + mProps.meetingID + " userId=" + msg.userid)

    val user = Users.findWithId(msg.userid, liveMeeting.users)
    user foreach { u =>
      if (liveMeeting.addGlobalAudioConnection(msg.userid)) {
        for {
          uvo <- Users.joinedVoiceListenOnly(msg.userid, liveMeeting.users)
        } yield {
          log.info("UserConnectedToGlobalAudio: meetingId=" + mProps.meetingID + " userId=" + uvo.id + " user=" + uvo)
          outGW.send(new UserListeningOnly(mProps.meetingID, mProps.recorded, uvo.id, uvo.listenOnly))
        }
      }
    }
  }

  def handleUserDisconnectedFromGlobalAudio(msg: UserDisconnectedFromGlobalAudio) {
    log.info("Handling UserDisconnectedToGlobalAudio: meetingId=" + mProps.meetingID + " userId=" + msg.userid)

    val user = Users.findWithId(msg.userid, liveMeeting.users)
    user foreach { u =>
      if (liveMeeting.removeGlobalAudioConnection(msg.userid)) {
        if (!u.joinedWeb) {
          for {
            uvo <- Users.userLeft(u.id, liveMeeting.users)
          } yield {
            log.info("Not web user. Send user left message. meetingId=" + mProps.meetingID + " userId=" + u.id + " user=" + u)
            outGW.send(new UserLeft(mProps.meetingID, mProps.recorded, uvo))
          }
        } else {
          for {
            uvo <- Users.leftVoiceListenOnly(u.id, liveMeeting.users)
          } yield {
            log.info("UserDisconnectedToGlobalAudio: meetingId=" + mProps.meetingID + " userId=" + uvo.id + " user=" + uvo)
            outGW.send(new UserListeningOnly(mProps.meetingID, mProps.recorded, uvo.id, uvo.listenOnly))
          }
        }
      }
    }
  }

  def handleMuteAllExceptPresenterRequest(msg: MuteAllExceptPresenterRequest) {
    if (msg.mute) {
      liveMeeting.meetingModel.muteMeeting()
    } else {
      liveMeeting.meetingModel.unmuteMeeting()
    }
    outGW.send(new MeetingMuted(mProps.meetingID, mProps.recorded, liveMeeting.meetingModel.isMeetingMuted()))

    usersWhoAreNotPresenter foreach { u =>
      outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded, msg.requesterID,
        u.id, mProps.voiceBridge, u.voiceUser.userId, msg.mute))
    }
  }

  def handleMuteMeetingRequest(msg: MuteMeetingRequest) {
    if (msg.mute) {
      liveMeeting.meetingModel.muteMeeting()
    } else {
      liveMeeting.meetingModel.unmuteMeeting()
    }
    outGW.send(new MeetingMuted(mProps.meetingID, mProps.recorded, liveMeeting.meetingModel.isMeetingMuted()))
    Users.getUsers(liveMeeting.users) foreach { u =>
      outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded, msg.requesterID,
        u.id, mProps.voiceBridge, u.voiceUser.userId, msg.mute))
    }
  }

  def handleValidateAuthToken(msg: ValidateAuthToken) {
    log.info("Got ValidateAuthToken message. meetingId=" + msg.meetingID + " userId=" + msg.userId)
    RegisteredUsers.getRegisteredUserWithToken(msg.token, msg.userId, liveMeeting.registeredUsers.toVector) match {
      case Some(u) =>
        val replyTo = mProps.meetingID + '/' + msg.userId

        //send the reply
        outGW.send(new ValidateAuthTokenReply(mProps.meetingID, msg.userId, msg.token, true, msg.correlationId))

        log.info("ValidateToken success. meetingId=" + mProps.meetingID + " userId=" + msg.userId)

        //join the user
        handleUserJoin(new UserJoining(mProps.meetingID, msg.userId, msg.token))
      case None =>
        log.info("ValidateToken failed. meetingId=" + mProps.meetingID + " userId=" + msg.userId)
        outGW.send(new ValidateAuthTokenReply(mProps.meetingID, msg.userId, msg.token, false, msg.correlationId))
    }
  }

  def handleRegisterUser(msg: RegisterUser) {
    if (liveMeeting.meetingModel.hasMeetingEnded()) {
      // Check first if the meeting has ended and the user refreshed the client to re-connect.
      log.info("Register user failed. Mmeeting has ended. meetingId=" + mProps.meetingID + " userId=" + msg.userID)
      sendMeetingHasEnded(msg.userID)
    } else {
      val regUser = new RegisteredUser(msg.userID, msg.extUserID, msg.name, msg.role, msg.authToken, msg.avatarURL,
        msg.guest, msg.authed, msg.guest)
      liveMeeting.registeredUsers.save(regUser)

      log.info("Register user success. meetingId=" + mProps.meetingID + " userId=" + msg.userID + " user=" + regUser)
      outGW.send(new UserRegistered(mProps.meetingID, mProps.recorded, regUser))
    }

  }

  def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
    outGW.send(new IsMeetingMutedReply(mProps.meetingID, mProps.recorded,
      msg.requesterID, liveMeeting.meetingModel.isMeetingMuted()))
  }

  def handleMuteUserRequest(msg: MuteUserRequest) {
    log.info("Received mute user request. meetingId=" + mProps.meetingID + " userId=" + msg.userID + " mute=" + msg.mute)
    Users.findWithId(msg.userID, liveMeeting.users) match {
      case Some(u) => {
        log.info("Send mute user request. meetingId=" + mProps.meetingID + " userId=" + u.id + " user=" + u)
        outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded,
          msg.requesterID, u.id, mProps.voiceBridge,
          u.voiceUser.userId, msg.mute))
      }
      case None => {
        log.info("Could not find user to mute.  meetingId=" + mProps.meetingID + " userId=" + msg.userID)
      }
    }
  }

  def handleEjectUserRequest(msg: EjectUserFromVoiceRequest) {
    log.info("Received eject user request. meetingId=" + msg.meetingID + " userId=" + msg.userId)
    Users.findWithId(msg.userId, liveMeeting.users) match {
      case Some(u) => {
        if (u.voiceUser.joined) {
          log.info("Ejecting user from voice.  meetingId=" + mProps.meetingID + " userId=" + u.id)
          outGW.send(new EjectVoiceUser(mProps.meetingID, mProps.recorded, msg.ejectedBy, u.id, mProps.voiceBridge, u.voiceUser.userId))
        }
      }
      case None => // do nothing
    }
  }

  def handleGetLockSettings(msg: GetLockSettings) {
    //println("*************** Reply with current lock settings ********************")

    //reusing the existing handle for NewPermissionsSettings to reply to the GetLockSettings request
    outGW.send(new NewPermissionsSetting(mProps.meetingID, msg.userId,
      liveMeeting.meetingModel.getPermissions(), Users.getUsers(liveMeeting.users).toArray))
  }

  def handleSetLockSettings(msg: SetLockSettings) {
    if (!liveMeeting.permissionsEqual(msg.settings)) {
      liveMeeting.newPermissions(msg.settings)
      outGW.send(new NewPermissionsSetting(mProps.meetingID, msg.setByUser,
        liveMeeting.meetingModel.getPermissions, Users.getUsers(liveMeeting.users).toArray))

      handleLockLayout(msg.settings.lockedLayout, msg.setByUser)
    }
  }

  def handleLockUserRequest(msg: LockUserRequest) {
    for {
      uvo <- Users.lockUser(msg.userID, msg.lock, liveMeeting.users)
    } yield {
      log.info("Lock user.  meetingId=" + mProps.meetingID + " userId=" + uvo.id + " locked=" + uvo.locked)
      outGW.send(new UserLocked(mProps.meetingID, uvo.id, uvo.locked))
    }
  }

  def handleInitLockSettings(msg: InitLockSettings) {
    if (!liveMeeting.meetingModel.permisionsInitialized()) {
      liveMeeting.meetingModel.initializePermissions()
      liveMeeting.newPermissions(msg.settings)
      outGW.send(new PermissionsSettingInitialized(msg.meetingID, msg.settings, Users.getUsers(liveMeeting.users).toArray))
    }
  }

  def handleInitAudioSettings(msg: InitAudioSettings) {
    if (!liveMeeting.meetingModel.audioSettingsInitialized()) {
      liveMeeting.meetingModel.initializeAudioSettings()

      if (liveMeeting.meetingModel.isMeetingMuted() != msg.muted) {
        handleMuteAllExceptPresenterRequest(
          new MuteAllExceptPresenterRequest(mProps.meetingID,
            msg.requesterID, msg.muted));
      }
    }
  }

  def usersWhoAreNotPresenter(): Array[UserVO] = {
    Users.usersWhoAreNotPresenter(liveMeeting.users).toArray
  }

  def handleUserEmojiStatus(msg: UserEmojiStatus) {
    for {
      uvo <- Users.setEmojiStatus(msg.userId, liveMeeting.users, msg.emojiStatus)
    } yield {
      outGW.send(new UserChangedEmojiStatus(mProps.meetingID, mProps.recorded, msg.emojiStatus, uvo.id))
    }
  }

  def handleChangeUserRole(msg: ChangeUserRole) {
    for {
      uvo <- Users.changeRole(msg.userID, liveMeeting.users, msg.role)
    } yield {
      RegisteredUsers.updateRegUser(uvo, liveMeeting.registeredUsers)
      val userRole = if (msg.role == Roles.MODERATOR_ROLE) "MODERATOR" else "VIEWER"
      outGW.send(new UserRoleChange(mProps.meetingID, mProps.recorded, msg.userID, userRole))
    }
  }

  def makeSurePresenterIsAssigned(user: UserVO): Unit = {
    if (user.presenter) {
      /* The current presenter has left the meeting. Find a moderator and make
       * him presenter. This way, if there is a moderator in the meeting, there
       * will always be a presenter.
       */
      val moderator = Users.findAModerator(liveMeeting.users)
      moderator.foreach { mod =>
        log.info("Presenter left meeting.  meetingId=" + mProps.meetingID + " userId=" + user.id
          + ". Making user=[" + mod.id + "] presenter.")
        assignNewPresenter(mod.id, mod.name, mod.id)
      }

      if (liveMeeting.meetingModel.isBroadcastingRTMP()) {
        // The presenter left during desktop sharing. Stop desktop sharing on FreeSWITCH
        outGW.send(new DeskShareHangUp(mProps.meetingID, mProps.voiceBridge))

        // notify other clients to close their deskshare view
        outGW.send(new DeskShareNotifyViewersRTMP(mProps.meetingID, liveMeeting.meetingModel.getRTMPBroadcastingUrl(),
          liveMeeting.meetingModel.getDesktopShareVideoWidth(), liveMeeting.meetingModel.getDesktopShareVideoHeight(), false))

        // reset meeting info
        liveMeeting.meetingModel.resetDesktopSharingParams()
      }
    }
  }

  def handleEjectUserFromMeeting(msg: EjectUserFromMeeting) {
    for {
      user <- Users.userLeft(msg.userId, liveMeeting.users)
    } yield {
      if (user.voiceUser.joined) {
        outGW.send(new EjectVoiceUser(mProps.meetingID, mProps.recorded,
          msg.ejectedBy, msg.userId, mProps.voiceBridge, user.voiceUser.userId))
      }
      liveMeeting.registeredUsers.delete(msg.userId)
      makeSurePresenterIsAssigned(user)

      log.info("Ejecting user from meeting.  meetingId=" + mProps.meetingID + " userId=" + msg.userId)
      outGW.send(new UserEjectedFromMeeting(mProps.meetingID, mProps.recorded, msg.userId, msg.ejectedBy))
      outGW.send(new DisconnectUser(mProps.meetingID, msg.userId))

      outGW.send(new UserLeft(msg.meetingID, mProps.recorded, user))
    }
  }

  def handleUserShareWebcam(msg: UserShareWebcam) {
    for {
      uvo <- Users.userSharedWebcam(msg.userId, liveMeeting.users, msg.stream)
    } yield {
      log.info("User shared webcam.  meetingId=" + mProps.meetingID + " userId=" + uvo.id + " stream=" + msg.stream)
      outGW.send(new UserSharedWebcam(mProps.meetingID, mProps.recorded, uvo.id, msg.stream))
    }
  }

  def handleUserunshareWebcam(msg: UserUnshareWebcam) {
    for {
      uvo <- Users.userUnsharedWebcam(msg.userId, liveMeeting.users, msg.stream)
    } yield {
      log.info("User unshared webcam.  meetingId=" + mProps.meetingID + " userId=" + uvo.id + " stream=" + msg.stream)
      outGW.send(new UserUnsharedWebcam(mProps.meetingID, mProps.recorded, uvo.id, msg.stream))
    }
  }

  def handleChangeUserStatus(msg: ChangeUserStatus): Unit = {
    if (Users.hasUserWithId(msg.userID, liveMeeting.users)) {
      outGW.send(new UserStatusChange(mProps.meetingID, mProps.recorded, msg.userID, msg.status, msg.value))
    }
  }

  def handleGetUsers(msg: GetUsers): Unit = {
    outGW.send(new GetUsersReply(msg.meetingID, msg.requesterID, Users.getUsers(liveMeeting.users).toArray))
  }

  def handleUserJoin(msg: UserJoining): Unit = {
    log.debug("Received user joined meeting. metingId=" + mProps.meetingID + " userId=" + msg.userID)

    def initVoiceUser(userId: String, ru: RegisteredUser): VoiceUser = {
      val wUser = Users.findWithId(userId, liveMeeting.users)

      wUser match {
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
    }

    val regUser = RegisteredUsers.getRegisteredUserWithToken(msg.authToken, msg.userID, liveMeeting.registeredUsers.toVector)
    regUser foreach { ru =>
      log.debug("Found registered user. metingId=" + mProps.meetingID + " userId=" + msg.userID + " ru=" + ru)

      val wUser = Users.findWithId(msg.userID, liveMeeting.users)

      val vu = initVoiceUser(msg.userID, ru)

      wUser.foreach { w =>
        if (!w.joinedWeb) {
          log.debug("User is in voice only. Mark as user left. metingId=" + mProps.meetingID + " userId=" + msg.userID)
          /**
           * If user is not joined through the web (perhaps reconnecting).
           * Send a user left event to clear up user list of all clients.
           */
          val user = Users.userLeft(w.id, liveMeeting.users)
          outGW.send(new UserLeft(msg.meetingID, mProps.recorded, w))
        }
      }

      /**
       * Initialize the newly joined user copying voice status in case this
       * join is due to a reconnect.
       */
      val waitingForAcceptance = ru.guest && liveMeeting.meetingModel.getGuestPolicy() == GuestPolicy.ASK_MODERATOR && ru.waitingForAcceptance
      val lockStatus = getInitialLockStatus(ru.role)

      for {
        uvo <- Users.newUser(msg.userID, lockStatus, ru, waitingForAcceptance, vu, liveMeeting.users)
      } yield {
        log.info("User joined meeting. metingId=" + mProps.meetingID + " userId=" + uvo.id + " user=" + uvo)

        if (uvo.guest && liveMeeting.meetingModel.getGuestPolicy() == GuestPolicy.ALWAYS_DENY) {
          outGW.send(new GuestAccessDenied(mProps.meetingID, mProps.recorded, uvo.id))
        } else {
          outGW.send(new UserJoined(mProps.meetingID, mProps.recorded, uvo))
          outGW.send(new MeetingState(mProps.meetingID, mProps.recorded, uvo.id, liveMeeting.meetingModel.getPermissions(), liveMeeting.meetingModel.isMeetingMuted()))
          if (!waitingForAcceptance) {
            // Become presenter if the only moderator
            if ((Users.numModerators(liveMeeting.users) == 1) || (Users.hasNoPresenter(liveMeeting.users))) {
              if (ru.role == Roles.MODERATOR_ROLE) {
                log.info("Assigning presenter to lone moderator. metingId=" + mProps.meetingID + " userId=" + uvo.id)
                assignNewPresenter(msg.userID, ru.name, msg.userID)
              }
            }
          } else {
            log.info("User waiting for acceptance. metingId=" + mProps.meetingID + " userId=" + uvo.id)
          }
          liveMeeting.webUserJoined
          startRecordingIfAutoStart()
        }
      }
    }
  }

  def handleUserLeft(msg: UserLeaving): Unit = {
    for {
      u <- Users.userLeft(msg.userID, liveMeeting.users)
    } yield {
      log.info("User left meeting. meetingId=" + mProps.meetingID + " userId=" + u.id + " user=" + u)
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
          vu.userId, u.id, u.externalId, vu.callerName,
          vu.callerNum, vu.muted, vu.talking, vu.avatarURL, u.listenOnly));
      }

      checkCaptionOwnerLogOut(u.id)
      liveMeeting.startCheckingIfWeNeedToEndVoiceConf()
      stopAutoStartedRecording()
    }
  }

  def getInitialLockStatus(role: String): Boolean = {
    liveMeeting.meetingModel.getPermissions().lockOnJoin && !role.equals(Roles.MODERATOR_ROLE)
  }

  def handleUserJoinedVoiceFromPhone(msg: UserJoinedVoiceConfMessage) = {
    log.info("User joining from phone.  meetingId=" + mProps.meetingID + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    val user = Users.getUserWithVoiceUserId(msg.voiceUserId, liveMeeting.users) match {
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
          Users.generateWebUserId(liveMeeting.users)
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
        val uvo = Users.makeUserPhoneUser(vu, liveMeeting.users, webUserId, msg.externUserId, msg.callerIdName,
          lockStatus = getInitialLockStatus(Roles.VIEWER_ROLE),
          listenOnly = msg.listenOnly, avatarURL = msg.avatarURL)

        log.info("User joined from phone.  meetingId=" + mProps.meetingID + " userId=" + uvo.id + " user=" + uvo)

        outGW.send(new UserJoined(mProps.meetingID, mProps.recorded, uvo))
        outGW.send(new UserJoinedVoice(mProps.meetingID, mProps.recorded, mProps.voiceBridge, uvo))

        if (liveMeeting.meetingModel.isMeetingMuted()) {
          outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded, uvo.id, uvo.id,
            mProps.voiceBridge, vu.userId, liveMeeting.meetingModel.isMeetingMuted()))
        }
      }
    }
  }

  def startRecordingVoiceConference() {
    if (Users.numUsersInVoiceConference(liveMeeting.users) == 1 &&
      mProps.recorded && !liveMeeting.isVoiceRecording) {
      liveMeeting.startRecordingVoice()
      log.info("Send START RECORDING voice conf. meetingId=" + mProps.meetingID + " voice conf=" + mProps.voiceBridge)
      outGW.send(new StartRecordingVoiceConf(mProps.meetingID, mProps.recorded, mProps.voiceBridge))
    }
  }

  def switchUserToPhoneUser(msg: UserJoinedVoiceConfMessage) = {
    log.info("User has been disconnected but still in voice conf. Switching to phone user. meetingId="
      + mProps.meetingID + " callername=" + msg.callerIdName
      + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    Users.findWithId(msg.userId, liveMeeting.users) match {
      case Some(user) => {
        val nu = Users.switchUserToPhoneUser(user, liveMeeting.users, msg.voiceUserId, msg.userId, msg.callerIdName,
          msg.callerIdNum, msg.muted, msg.talking, msg.avatarURL, msg.listenOnly)

        log.info("User joined voice. meetingId=" + mProps.meetingID + " userId=" + user.id + " user=" + nu)
        outGW.send(new UserJoinedVoice(mProps.meetingID, mProps.recorded, mProps.voiceBridge, nu))

        if (liveMeeting.meetingModel.isMeetingMuted()) {
          outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded,
            nu.id, nu.id, mProps.voiceBridge,
            nu.voiceUser.userId, liveMeeting.meetingModel.isMeetingMuted()))
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

    Users.findWithId(msg.userId, liveMeeting.users) match {
      case Some(user) => {
        // this is used to restore the mute state on reconnect
        val previouslyMuted = user.voiceUser.muted

        val nu = Users.restoreMuteState(user, liveMeeting.users, msg.voiceUserId, msg.userId, msg.callerIdName,
          msg.callerIdNum, msg.muted, msg.talking, msg.avatarURL, msg.listenOnly)

        log.info("User joined voice. meetingId=" + mProps.meetingID + " userId=" + user.id + " user=" + nu)
        outGW.send(new UserJoinedVoice(mProps.meetingID, mProps.recorded, mProps.voiceBridge, nu))

        if (liveMeeting.meetingModel.isMeetingMuted() || previouslyMuted) {
          outGW.send(new MuteVoiceUser(mProps.meetingID, mProps.recorded,
            nu.id, nu.id, mProps.voiceBridge,
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
    if (Users.numUsersInVoiceConference(liveMeeting.users) == 0 &&
      mProps.recorded && liveMeeting.isVoiceRecording) {
      liveMeeting.stopRecordingVoice()
      log.info("Send STOP RECORDING voice conf. meetingId=" + mProps.meetingID + " voice conf=" + mProps.voiceBridge)
      outGW.send(new StopRecordingVoiceConf(mProps.meetingID, mProps.recorded,
        mProps.voiceBridge, liveMeeting.meetingModel.getVoiceRecordingFilename()))
    }
  }

  def handleUserLeftVoiceConfMessage(msg: UserLeftVoiceConfMessage) {
    log.info("Received user left voice conf. meetingId=" + mProps.meetingID + " voice conf=" + msg.voiceConfId
      + " userId=" + msg.voiceUserId)

    for {
      user <- Users.getUserWithVoiceUserId(msg.voiceUserId, liveMeeting.users)
      nu = Users.resetVoiceUser(user, liveMeeting.users)
    } yield {
      log.info("User left voice conf. meetingId=" + mProps.meetingID + " userId=" + nu.id + " user=" + nu)
      outGW.send(new UserLeftVoice(mProps.meetingID, mProps.recorded, mProps.voiceBridge, nu))

      if (user.phoneUser) {
        for {
          userLeaving <- Users.userLeft(user.id, liveMeeting.users)
        } yield {
          outGW.send(new UserLeft(mProps.meetingID, mProps.recorded, userLeaving))
        }
      }
    }

    stopRecordingVoiceConference()

  }

  def handleUserMutedInVoiceConfMessage(msg: UserMutedInVoiceConfMessage) {
    for {
      user <- Users.getUserWithVoiceUserId(msg.voiceUserId, liveMeeting.users)
      nu = Users.setUserMuted(user, liveMeeting.users, msg.muted)
    } yield {
      log.info("User muted in voice conf. meetingId=" + mProps.meetingID + " userId=" + nu.id + " user=" + nu)

      outGW.send(new UserVoiceMuted(mProps.meetingID, mProps.recorded, mProps.voiceBridge, nu))
    }
  }

  def handleUserTalkingInVoiceConfMessage(msg: UserTalkingInVoiceConfMessage) {
    for {
      user <- Users.getUserWithVoiceUserId(msg.voiceUserId, liveMeeting.users)
      nv = Users.setUserTalking(user, liveMeeting.users, msg.talking)
    } yield {
      outGW.send(new UserVoiceTalking(mProps.meetingID, mProps.recorded, mProps.voiceBridge, nv))
    }
  }

  def handleAssignPresenter(msg: AssignPresenter): Unit = {
    assignNewPresenter(msg.newPresenterID, msg.newPresenterName, msg.assignedBy)
  }

  def assignNewPresenter(newPresenterID: String, newPresenterName: String, assignedBy: String) {
    // Stop poll if one is running as presenter left.
    handleStopPollRequest(StopPollRequest(mProps.meetingID, assignedBy))

    def removePresenterRightsToCurrentPresenter(): Unit = {
      for {
        curPres <- Users.getCurrentPresenter(liveMeeting.users)
      } yield {
        Users.unbecomePresenter(curPres.id, liveMeeting.users)
        outGW.send(new UserStatusChange(mProps.meetingID, mProps.recorded, curPres.id, "presenter", false: java.lang.Boolean))
      }
    }

    for {
      newPres <- Users.findWithId(newPresenterID, liveMeeting.users)
    } yield {
      removePresenterRightsToCurrentPresenter()
      Users.becomePresenter(newPres.id, liveMeeting.users)
      liveMeeting.setCurrentPresenterInfo(new Presenter(newPresenterID, newPresenterName, assignedBy))
      outGW.send(new PresenterAssigned(mProps.meetingID, mProps.recorded, new Presenter(newPresenterID, newPresenterName, assignedBy)))
      outGW.send(new UserStatusChange(mProps.meetingID, mProps.recorded, newPresenterID, "presenter", true: java.lang.Boolean))
    }
  }

  def handleRespondToGuest(msg: RespondToGuest) {
    if (Users.isModerator(msg.requesterID, liveMeeting.users)) {
      var usersToAnswer: Array[UserVO] = null;
      if (msg.userId == null) {
        usersToAnswer = Users.getUsers(liveMeeting.users).filter(u => u.waitingForAcceptance == true).toArray
      } else {
        usersToAnswer = Users.getUsers(liveMeeting.users).filter(u => u.waitingForAcceptance == true && u.id == msg.userId).toArray
      }
      usersToAnswer foreach { user =>
        println("UsersApp - handleGuestAccessDenied for user [" + user.id + "]");
        if (msg.response == true) {
          val nu = Users.setWaitingForAcceptance(user, liveMeeting.users, false)
          RegisteredUsers.updateRegUser(nu, liveMeeting.registeredUsers)
          outGW.send(new UserJoined(mProps.meetingID, mProps.recorded, nu))
        } else {
          outGW.send(new GuestAccessDenied(mProps.meetingID, mProps.recorded, user.id))
        }
      }
    }
  }
}
