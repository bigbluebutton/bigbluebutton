package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.GuestPolicy
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait UsersApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserConnectedToGlobalAudio(msg: UserConnectedToGlobalAudio) {
    log.info("Handling UserConnectedToGlobalAudio: meetingId=" + props.meetingProp.intId + " userId=" + msg.userid)

    val user = Users.findWithId(msg.userid, liveMeeting.users)
    user foreach { u =>
      if (MeetingStatus2x.addGlobalAudioConnection(liveMeeting.status, msg.userid)) {
        for {
          uvo <- Users.joinedVoiceListenOnly(msg.userid, liveMeeting.users)
        } yield {
          log.info("UserConnectedToGlobalAudio: meetingId=" + props.meetingProp.intId + " userId=" + uvo.id + " user=" + uvo)
          outGW.send(new UserListeningOnly(props.meetingProp.intId, props.recordProp.record, uvo.id, uvo.listenOnly))
        }
      }
    }
  }

  def handleUserDisconnectedFromGlobalAudio(msg: UserDisconnectedFromGlobalAudio) {
    log.info("Handling UserDisconnectedToGlobalAudio: meetingId=" + props.meetingProp.intId + " userId=" + msg.userid)

    val user = Users.findWithId(msg.userid, liveMeeting.users)
    user foreach { u =>
      if (MeetingStatus2x.removeGlobalAudioConnection(liveMeeting.status, msg.userid)) {
        if (!u.joinedWeb) {
          for {
            uvo <- Users.userLeft(u.id, liveMeeting.users)
          } yield {
            log.info("Not web user. Send user left message. meetingId=" + props.meetingProp.intId + " userId=" + u.id + " user=" + u)
            outGW.send(new UserLeft(props.meetingProp.intId, props.recordProp.record, uvo))
          }
        } else {
          for {
            uvo <- Users.leftVoiceListenOnly(u.id, liveMeeting.users)
          } yield {
            log.info("UserDisconnectedToGlobalAudio: meetingId=" + props.meetingProp.intId + " userId=" + uvo.id + " user=" + uvo)
            outGW.send(new UserListeningOnly(props.meetingProp.intId, props.recordProp.record, uvo.id, uvo.listenOnly))
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
    outGW.send(new MeetingMuted(props.meetingProp.intId, props.recordProp.record, liveMeeting.meetingModel.isMeetingMuted()))

    usersWhoAreNotPresenter foreach { u =>
      outGW.send(new MuteVoiceUser(props.meetingProp.intId, props.recordProp.record, msg.requesterID,
        u.id, props.voiceProp.voiceConf, u.voiceUser.userId, msg.mute))
    }
  }

  def handleMuteMeetingRequest(msg: MuteMeetingRequest) {
    if (msg.mute) {
      liveMeeting.meetingModel.muteMeeting()
    } else {
      liveMeeting.meetingModel.unmuteMeeting()
    }
    outGW.send(new MeetingMuted(props.meetingProp.intId, props.recordProp.record, liveMeeting.meetingModel.isMeetingMuted()))
    Users.getUsers(liveMeeting.users) foreach { u =>
      outGW.send(new MuteVoiceUser(props.meetingProp.intId, props.recordProp.record, msg.requesterID,
        u.id, props.voiceProp.voiceConf, u.voiceUser.userId, msg.mute))
    }
  }

  def handleValidateAuthToken(msg: ValidateAuthToken) {
    log.info("Got ValidateAuthToken message. meetingId=" + msg.meetingID + " userId=" + msg.userId)
    RegisteredUsers.getRegisteredUserWithToken(msg.token, msg.userId, liveMeeting.registeredUsers) match {
      case Some(u) =>

        //send the reply
        outGW.send(new ValidateAuthTokenReply(props.meetingProp.intId, msg.userId, msg.token, true, msg.correlationId))

        log.info("ValidateToken success. meetingId=" + props.meetingProp.intId + " userId=" + msg.userId)

        //join the user
        handleUserJoin(new UserJoining(props.meetingProp.intId, msg.userId, msg.token))
      case None =>
        log.info("ValidateToken failed. meetingId=" + props.meetingProp.intId + " userId=" + msg.userId)
        outGW.send(new ValidateAuthTokenReply(props.meetingProp.intId, msg.userId, msg.token, false, msg.correlationId))
    }
  }

  def handleRegisterUser(msg: RegisterUser) {
    if (liveMeeting.meetingModel.hasMeetingEnded()) {
      // Check first if the meeting has ended and the user refreshed the client to re-connect.
      log.info("Register user failed. Mmeeting has ended. meetingId=" + props.meetingProp.intId + " userId=" + msg.userID)
      sendMeetingHasEnded(msg.userID)
    } else {
      val regUser = RegisteredUsers.create(msg.userID, msg.extUserID, msg.name, msg.role, msg.authToken,
        msg.avatarURL, msg.guest, msg.authed, msg.guest, liveMeeting.registeredUsers)

      log.info("Register user success. meetingId=" + props.meetingProp.intId + " userId=" + msg.userID + " user=" + regUser)
      outGW.send(new UserRegistered(props.meetingProp.intId, props.recordProp.record, regUser))
    }

  }

  def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
    outGW.send(new IsMeetingMutedReply(props.meetingProp.intId, props.recordProp.record,
      msg.requesterID, liveMeeting.meetingModel.isMeetingMuted()))
  }

  def handleMuteUserRequest(msg: MuteUserRequest) {
    log.info("Received mute user request. meetingId=" + props.meetingProp.intId + " userId=" + msg.userID + " mute=" + msg.mute)
    for {
      u <- Users.findWithId(msg.userID, liveMeeting.users)
    } yield {
      log.info("Send mute user request. meetingId=" + props.meetingProp.intId + " userId=" + u.id + " user=" + u)
      outGW.send(new MuteVoiceUser(props.meetingProp.intId, props.recordProp.record,
        msg.requesterID, u.id, props.voiceProp.voiceConf, u.voiceUser.userId, msg.mute))
    }
  }

  def handleEjectUserRequest(msg: EjectUserFromVoiceRequest) {
    log.info("Received eject user request. meetingId=" + msg.meetingID + " userId=" + msg.userId)

    for {
      u <- Users.findWithId(msg.userId, liveMeeting.users)
    } yield {
      if (u.voiceUser.joined) {
        log.info("Ejecting user from voice.  meetingId=" + props.meetingProp.intId + " userId=" + u.id)
        outGW.send(new EjectVoiceUser(props.meetingProp.intId, props.recordProp.record, msg.ejectedBy, u.id,
          props.voiceProp.voiceConf, u.voiceUser.userId))
      }
    }
  }

  def handleGetLockSettings(msg: GetLockSettings) {
    //println("*************** Reply with current lock settings ********************")

    //reusing the existing handle for NewPermissionsSettings to reply to the GetLockSettings request
    outGW.send(new NewPermissionsSetting(props.meetingProp.intId, msg.userId,
      liveMeeting.meetingModel.getPermissions(), Users.getUsers(liveMeeting.users).toArray))
  }

  def handleSetLockSettings(msg: SetLockSettings) {
    if (!liveMeeting.permissionsEqual(msg.settings)) {
      liveMeeting.newPermissions(msg.settings)
      outGW.send(new NewPermissionsSetting(props.meetingProp.intId, msg.setByUser,
        liveMeeting.meetingModel.getPermissions, Users.getUsers(liveMeeting.users).toArray))

      handleLockLayout(msg.settings.lockedLayout, msg.setByUser)
    }
  }

  def handleLockUserRequest(msg: LockUserRequest) {
    for {
      uvo <- Users.lockUser(msg.userID, msg.lock, liveMeeting.users)
    } yield {
      log.info("Lock user.  meetingId=" + props.meetingProp.intId + " userId=" + uvo.id + " locked=" + uvo.locked)
      outGW.send(new UserLocked(props.meetingProp.intId, uvo.id, uvo.locked))
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
          new MuteAllExceptPresenterRequest(props.meetingProp.intId,
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
      outGW.send(new UserChangedEmojiStatus(props.meetingProp.intId, props.recordProp.record, msg.emojiStatus, uvo.id))
    }
  }

  def handleChangeUserRole(msg: ChangeUserRole) {
    for {
      uvo <- Users.changeRole(msg.userID, liveMeeting.users, msg.role)
    } yield {
      RegisteredUsers.updateRegUser(uvo, liveMeeting.registeredUsers)
      val userRole = if (msg.role == Roles.MODERATOR_ROLE) "MODERATOR" else "VIEWER"
      outGW.send(new UserRoleChange(props.meetingProp.intId, props.recordProp.record, msg.userID, userRole))
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
        log.info("Presenter left meeting.  meetingId=" + props.meetingProp.intId + " userId=" + user.id
          + ". Making user=[" + mod.id + "] presenter.")
        assignNewPresenter(mod.id, mod.name, mod.id)
      }

      if (liveMeeting.meetingModel.isBroadcastingRTMP()) {
        // The presenter left during desktop sharing. Stop desktop sharing on FreeSWITCH
        outGW.send(new DeskShareHangUp(props.meetingProp.intId, props.voiceProp.voiceConf))

        // notify other clients to close their deskshare view
        outGW.send(new DeskShareNotifyViewersRTMP(props.meetingProp.intId, liveMeeting.meetingModel.getRTMPBroadcastingUrl(),
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
        outGW.send(new EjectVoiceUser(props.meetingProp.intId, props.recordProp.record,
          msg.ejectedBy, msg.userId, props.voiceProp.voiceConf, user.voiceUser.userId))
      }
      RegisteredUsers.remove(msg.userId, liveMeeting.registeredUsers)
      makeSurePresenterIsAssigned(user)

      log.info("Ejecting user from meeting.  meetingId=" + props.meetingProp.intId + " userId=" + msg.userId)
      outGW.send(new UserEjectedFromMeeting(props.meetingProp.intId, props.recordProp.record, msg.userId, msg.ejectedBy))
      outGW.send(new DisconnectUser(props.meetingProp.intId, msg.userId))

      outGW.send(new UserLeft(msg.meetingID, props.recordProp.record, user))
    }
  }

  def handleUserShareWebcam(msg: UserShareWebcam) {
    for {
      uvo <- Users.userSharedWebcam(msg.userId, liveMeeting.users, msg.stream)
    } yield {
      log.info("User shared webcam.  meetingId=" + props.meetingProp.intId + " userId=" + uvo.id + " stream=" + msg.stream)
      outGW.send(new UserSharedWebcam(props.meetingProp.intId, props.recordProp.record, uvo.id, msg.stream))
    }
  }

  def handleUserunshareWebcam(msg: UserUnshareWebcam) {
    for {
      uvo <- Users.userUnsharedWebcam(msg.userId, liveMeeting.users, msg.stream)
    } yield {
      log.info("User unshared webcam.  meetingId=" + props.meetingProp.intId + " userId=" + uvo.id + " stream=" + msg.stream)
      outGW.send(new UserUnsharedWebcam(props.meetingProp.intId, props.recordProp.record, uvo.id, msg.stream))
    }
  }

  def handleChangeUserStatus(msg: ChangeUserStatus): Unit = {
    if (Users.hasUserWithId(msg.userID, liveMeeting.users)) {
      outGW.send(new UserStatusChange(props.meetingProp.intId, props.recordProp.record, msg.userID, msg.status, msg.value))
    }
  }

  def handleGetUsers(msg: GetUsers): Unit = {
    outGW.send(new GetUsersReply(msg.meetingID, msg.requesterID, Users.getUsers(liveMeeting.users).toArray))
  }

  def handleUserJoin(msg: UserJoining): Unit = {
    log.debug("Received user joined meeting. metingId=" + props.meetingProp.intId + " userId=" + msg.userID)

    def initVoiceUser(userId: String, ru: RegisteredUser): VoiceUser = {
      val wUser = Users.findWithId(userId, liveMeeting.users)

      wUser match {
        case Some(u) => {
          log.debug("Found  user. metingId=" + props.meetingProp.intId + " userId=" + msg.userID + " user=" + u)
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
          log.debug("User not found. metingId=" + props.meetingProp.intId + " userId=" + msg.userID)
          /**
           * New user. Initialize voice status.
           */
          new VoiceUser(msg.userID, msg.userID, ru.name, ru.name,
            joined = false, locked = false,
            muted = false, talking = false, ru.avatarURL, listenOnly = false)
        }
      }
    }

    val regUser = RegisteredUsers.getRegisteredUserWithToken(msg.authToken, msg.userID, liveMeeting.registeredUsers)
    regUser foreach { ru =>
      log.debug("Found registered user. metingId=" + props.meetingProp.intId + " userId=" + msg.userID + " ru=" + ru)

      val wUser = Users.findWithId(msg.userID, liveMeeting.users)

      val vu = initVoiceUser(msg.userID, ru)

      wUser.foreach { w =>
        if (!w.joinedWeb) {
          log.debug("User is in voice only. Mark as user left. metingId=" + props.meetingProp.intId + " userId=" + msg.userID)
          /**
           * If user is not joined through the web (perhaps reconnecting).
           * Send a user left event to clear up user list of all clients.
           */
          Users.userLeft(w.id, liveMeeting.users)
          outGW.send(new UserLeft(msg.meetingID, props.recordProp.record, w))
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
        log.info("User joined meeting. metingId=" + props.meetingProp.intId + " userId=" + uvo.id + " user=" + uvo)

        if (uvo.guest && liveMeeting.meetingModel.getGuestPolicy() == GuestPolicy.ALWAYS_DENY) {
          outGW.send(new GuestAccessDenied(props.meetingProp.intId, props.recordProp.record, uvo.id))
        } else {
          outGW.send(new UserJoined(props.meetingProp.intId, props.recordProp.record, uvo))
          outGW.send(new MeetingState(props.meetingProp.intId, props.recordProp.record, uvo.id,
            liveMeeting.meetingModel.getPermissions(), liveMeeting.meetingModel.isMeetingMuted()))

          if (!waitingForAcceptance) {
            // Become presenter if the only moderator
            if ((Users.numModerators(liveMeeting.users) == 1) || (Users.hasNoPresenter(liveMeeting.users))) {
              if (ru.role == Roles.MODERATOR_ROLE) {
                log.info("Assigning presenter to lone moderator. metingId=" + props.meetingProp.intId + " userId=" + uvo.id)
                assignNewPresenter(msg.userID, ru.name, msg.userID)
              }
            }
          } else {
            log.info("User waiting for acceptance. metingId=" + props.meetingProp.intId + " userId=" + uvo.id)
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
      log.info("User left meeting. meetingId=" + props.meetingProp.intId + " userId=" + u.id + " user=" + u)
      outGW.send(new UserLeft(msg.meetingID, props.recordProp.record, u))

      makeSurePresenterIsAssigned(u)

      val vu = u.voiceUser
      if (vu.joined || u.listenOnly) {
        /**
         * The user that left is still in the voice conference. Maybe this user just got disconnected
         * and is reconnecting. Make the user as joined only in the voice conference. If we get a
         * user left voice conference message, then we will remove the user from the users list.
         */
        switchUserToPhoneUser(new UserJoinedVoiceConfMessage(props.voiceProp.voiceConf,
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
    log.info("User joining from phone.  meetingId=" + props.meetingProp.intId + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    Users.getUserWithVoiceUserId(msg.voiceUserId, liveMeeting.users) match {
      case Some(user) => {
        log.info("Voice user=" + msg.voiceUserId + " is already in conf="
          + props.voiceProp.voiceConf + ". Must be duplicate message. meetigId=" + props.meetingProp.intId)
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

        log.info("User joined from phone.  meetingId=" + props.meetingProp.intId + " userId=" + uvo.id + " user=" + uvo)

        outGW.send(new UserJoined(props.meetingProp.intId, props.recordProp.record, uvo))
        outGW.send(new UserJoinedVoice(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf, uvo))

        if (liveMeeting.meetingModel.isMeetingMuted()) {
          outGW.send(new MuteVoiceUser(props.meetingProp.intId, props.recordProp.record, uvo.id, uvo.id,
            props.voiceProp.voiceConf, vu.userId, liveMeeting.meetingModel.isMeetingMuted()))
        }
      }
    }
  }

  def startRecordingVoiceConference() {
    if (Users.numUsersInVoiceConference(liveMeeting.users) == 1 &&
      props.recordProp.record &&
      !MeetingStatus2x.isVoiceRecording(liveMeeting.status)) {
      MeetingStatus2x.startRecordingVoice(liveMeeting.status)
      log.info("Send START RECORDING voice conf. meetingId=" + props.meetingProp.intId + " voice conf=" + props.voiceProp.voiceConf)
      outGW.send(new StartRecordingVoiceConf(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf))
    }
  }

  def switchUserToPhoneUser(msg: UserJoinedVoiceConfMessage) = {
    log.info("User has been disconnected but still in voice conf. Switching to phone user. meetingId="
      + props.meetingProp.intId + " callername=" + msg.callerIdName
      + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    Users.findWithId(msg.userId, liveMeeting.users) match {
      case Some(user) => {
        val nu = Users.switchUserToPhoneUser(user, liveMeeting.users, msg.voiceUserId, msg.userId, msg.callerIdName,
          msg.callerIdNum, msg.muted, msg.talking, msg.avatarURL, msg.listenOnly)

        log.info("User joined voice. meetingId=" + props.meetingProp.intId + " userId=" + user.id + " user=" + nu)
        outGW.send(new UserJoinedVoice(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf, nu))

        if (liveMeeting.meetingModel.isMeetingMuted()) {
          outGW.send(new MuteVoiceUser(props.meetingProp.intId, props.recordProp.record,
            nu.id, nu.id, props.voiceProp.voiceConf,
            nu.voiceUser.userId, liveMeeting.meetingModel.isMeetingMuted()))
        }
      }
      case None => {
        handleUserJoinedVoiceFromPhone(msg)
      }
    }
  }

  def handleUserJoinedVoiceConfMessage(msg: UserJoinedVoiceConfMessage) = {
    log.info("Received user joined voice. meetingId=" + props.meetingProp.intId + " callername=" + msg.callerIdName
      + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    Users.findWithId(msg.userId, liveMeeting.users) match {
      case Some(user) => {
        // this is used to restore the mute state on reconnect
        val previouslyMuted = user.voiceUser.muted

        val nu = Users.restoreMuteState(user, liveMeeting.users, msg.voiceUserId, msg.userId, msg.callerIdName,
          msg.callerIdNum, msg.muted, msg.talking, msg.avatarURL, msg.listenOnly)

        log.info("User joined voice. meetingId=" + props.meetingProp.intId + " userId=" + user.id + " user=" + nu)
        outGW.send(new UserJoinedVoice(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf, nu))

        if (liveMeeting.meetingModel.isMeetingMuted() || previouslyMuted) {
          outGW.send(new MuteVoiceUser(props.meetingProp.intId, props.recordProp.record,
            nu.id, nu.id, props.voiceProp.voiceConf,
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
      props.recordProp.record &&
      MeetingStatus2x.isVoiceRecording(liveMeeting.status)) {
      MeetingStatus2x.stopRecordingVoice(liveMeeting.status)
      log.info("Send STOP RECORDING voice conf. meetingId=" + props.meetingProp.intId + " voice conf=" + props.voiceProp.voiceConf)
      outGW.send(new StopRecordingVoiceConf(props.meetingProp.intId, props.recordProp.record,
        props.voiceProp.voiceConf, liveMeeting.meetingModel.getVoiceRecordingFilename()))
    }
  }

  def handleUserLeftVoiceConfMessage(msg: UserLeftVoiceConfMessage) {
    log.info("Received user left voice conf. meetingId=" + props.meetingProp.intId + " voice conf=" + msg.voiceConfId
      + " userId=" + msg.voiceUserId)

    for {
      user <- Users.getUserWithVoiceUserId(msg.voiceUserId, liveMeeting.users)
      nu = Users.resetVoiceUser(user, liveMeeting.users)
    } yield {
      log.info("User left voice conf. meetingId=" + props.meetingProp.intId + " userId=" + nu.id + " user=" + nu)
      outGW.send(new UserLeftVoice(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf, nu))

      if (user.phoneUser) {
        for {
          userLeaving <- Users.userLeft(user.id, liveMeeting.users)
        } yield {
          outGW.send(new UserLeft(props.meetingProp.intId, props.recordProp.record, userLeaving))
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
      log.info("User muted in voice conf. meetingId=" + props.meetingProp.intId + " userId=" + nu.id + " user=" + nu)

      outGW.send(new UserVoiceMuted(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf, nu))
    }
  }

  def handleUserTalkingInVoiceConfMessage(msg: UserTalkingInVoiceConfMessage) {
    for {
      user <- Users.getUserWithVoiceUserId(msg.voiceUserId, liveMeeting.users)
      nv = Users.setUserTalking(user, liveMeeting.users, msg.talking)
    } yield {
      outGW.send(new UserVoiceTalking(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf, nv))
    }
  }

  def handleAssignPresenter(msg: AssignPresenter): Unit = {
    assignNewPresenter(msg.newPresenterID, msg.newPresenterName, msg.assignedBy)
  }

  def assignNewPresenter(newPresenterID: String, newPresenterName: String, assignedBy: String) {
    // Stop poll if one is running as presenter left.
    handleStopPollRequest(StopPollRequest(props.meetingProp.intId, assignedBy))

    def removePresenterRightsToCurrentPresenter(): Unit = {
      for {
        curPres <- Users.getCurrentPresenter(liveMeeting.users)
      } yield {
        Users.unbecomePresenter(curPres.id, liveMeeting.users)
        outGW.send(new UserStatusChange(props.meetingProp.intId, props.recordProp.record, curPres.id, "presenter", false: java.lang.Boolean))
      }
    }

    for {
      newPres <- Users.findWithId(newPresenterID, liveMeeting.users)
    } yield {
      removePresenterRightsToCurrentPresenter()
      Users.becomePresenter(newPres.id, liveMeeting.users)
      MeetingStatus2x.setCurrentPresenterInfo(liveMeeting.status, new Presenter(newPresenterID, newPresenterName, assignedBy))
      outGW.send(new PresenterAssigned(props.meetingProp.intId, props.recordProp.record, new Presenter(newPresenterID, newPresenterName, assignedBy)))
      outGW.send(new UserStatusChange(props.meetingProp.intId, props.recordProp.record, newPresenterID, "presenter", true: java.lang.Boolean))
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
          outGW.send(new UserJoined(props.meetingProp.intId, props.recordProp.record, nu))
        } else {
          outGW.send(new GuestAccessDenied(props.meetingProp.intId, props.recordProp.record, user.id))
        }
      }
    }
  }
}
