package org.bigbluebutton.core.handlers

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.domain.Role
import org.bigbluebutton.core.domain._
import scala.collection.mutable.ArrayBuffer
import scala.collection.immutable.ListSet
import org.bigbluebutton.core.LiveMeeting

trait UsersHandler extends UsersApp {
  this: LiveMeeting =>

  val sender = new UsersMessageSender(outGW)

  def handleUserConnectedToGlobalAudio(msg: UserConnectedToGlobalAudio) {
    log.info("Handling UserConnectedToGlobalAudio: meetingId=" + props.id + " userId=" + msg.userId)

    val user = meeting.getUser(msg.userId)
    user foreach { u =>
      if (meeting.addGlobalAudioConnection(msg.userId)) {
        val vu = u.voiceUser.copy(joinedVoice = JoinedVoice(false), talking = Talking(false))
        val uvo = u.copy(listenOnly = ListenOnly(true), voiceUser = vu)
        meeting.saveUser(uvo)
        log.info("UserConnectedToGlobalAudio: meetingId=" + props.id + " userId=" + uvo.id + " user=" + uvo)
        sender.sendUserListeningOnlyMessage(props.id, props.recorded, uvo.id, uvo.listenOnly)
      }
    }
  }

  def handleUserDisconnectedFromGlobalAudio(msg: UserDisconnectedFromGlobalAudio) {
    log.info("Handling UserDisconnectedToGlobalAudio: meetingId=" + props.id + " userId=" + msg.userId)

    val user = meeting.getUser(msg.userId)
    user foreach { u =>
      if (meeting.removeGlobalAudioConnection(msg.userId)) {
        if (!u.joinedWeb.value) {
          val userLeaving = meeting.removeUser(u.id)
          log.info("Not web user. Send user left message. meetingId=" + props.id + " userId=" + u.id + " user=" + u)
          userLeaving foreach (u => sender.sendUserLeftMessage(props.id, props.recorded, u))
        } else {
          val vu = u.voiceUser.copy(joinedVoice = JoinedVoice(false))
          val uvo = u.copy(listenOnly = ListenOnly(false), voiceUser = vu)
          meeting.saveUser(uvo)
          log.info("UserDisconnectedToGlobalAudio: meetingId=" + props.id + " userId=" + uvo.id + " user=" + uvo)
          sender.sendUserListeningOnlyMessage(props.id, props.recorded, uvo.id, uvo.listenOnly)
        }
      }
    }
  }

  def handleMuteAllExceptPresenterRequest(msg: MuteAllExceptPresenterRequest) {
    if (msg.mute) {
      meeting.muteMeeting()
    } else {
      meeting.unmuteMeeting()
    }

    sender.sendMeetingMutedMessage(props.id, props.recorded, meeting.isMeetingMuted)
    usersWhoAreNotPresenter foreach { u =>
      sender.sendMuteVoiceUserMessage(props.id, props.recorded, u.id, msg.requesterId,
        u.voiceUser.id, props.voiceConf, msg.mute)
    }
  }

  def handleMuteMeetingRequest(msg: MuteMeetingRequest) {
    if (msg.mute) {
      meeting.muteMeeting()
    } else {
      meeting.unmuteMeeting()
    }
    sender.sendMeetingMutedMessage(props.id, props.recorded, meeting.isMeetingMuted)
    meeting.getUsers foreach { u =>
      sender.sendMuteVoiceUserMessage(props.id, props.recorded, u.id, msg.requesterId,
        u.voiceUser.id, props.voiceConf, msg.mute)
    }
  }

  def handleValidateAuthToken(msg: ValidateAuthToken) {
    log.info("Got ValidateAuthToken message. meetingId=" + msg.meetingId + " userId=" + msg.userId)
    meeting.findWithToken(msg.token) match {
      case Some(u) =>
        val replyTo = props.id.value + '/' + msg.userId

        //send the reply
        sender.sendValidateAuthTokenReplyMessage(props.id, msg.userId, msg.token, true, msg.correlationId)
        log.info("ValidateToken success. meetingId=" + props.id + " userId=" + msg.userId)

        //join the user
        handleUserJoin(new UserJoining(props.id, msg.userId, msg.token))
      case None =>
        log.info("ValidateToken failed. meetingId=" + props.id + " userId=" + msg.userId)
        sender.sendValidateAuthTokenReplyMessage(props.id, msg.userId, msg.token, false, msg.correlationId)

    }

    /**
     * Send a reply to BigBlueButtonActor to let it know this MeetingActor hasn't hung!
     * Sometimes, the actor seems to hang and doesn't anymore accept messages. This is a simple
     * audit to check whether the actor is still alive. (ralam feb 25, 2015)
     */
    //sender ! new ValidateAuthTokenReply(mProps.meetingID, msg.userId, msg.token, false, msg.correlationId)
  }

  def handleRegisterUser(msg: RegisterUser): Unit = {
    if (meeting.hasMeetingEnded) {
      // Check first is the meeting has ended and the user refreshed the client to reconnect.
      log.info("Register user failed. Meeting has ended. meetingId=" + props.id + " userId=" + msg.userId)
      sender.sendMeetingHasEnded(props.id, msg.userId)
    } else {
      for {
        regUser <- meeting.createRegisteredUser(msg.userId, msg.extUserId, msg.name, msg.roles, msg.authToken)
        rUsers = meeting.addRegisteredUser(msg.authToken, regUser)
      } yield sender.sendUserRegisteredMessage(props.id, props.recorded, regUser)
    }
  }

  def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
    sender.sendIsMeetingMutedReplyMessage(props.id, props.recorded, msg.requesterId, meeting.isMeetingMuted)
  }

  def handleMuteUserRequest(msg: MuteUserRequest) {
    log.info("Received mute user request. meetingId=" + props.id + " userId=" + msg.userId + " mute=" + msg.mute)
    meeting.getUser(msg.userId) match {
      case Some(u) =>
        log.info("Send mute user request. meetingId=" + props.id + " userId=" + u.id + " user=" + u)
        sender.sendMuteVoiceUserMessage(props.id, props.recorded, u.id, msg.requesterId,
          u.voiceUser.id, props.voiceConf, msg.mute)

      case None =>
        log.info("Could not find user to mute.  meetingId=" + props.id + " userId=" + msg.userId)

    }
  }

  def handleEjectUserRequest(msg: EjectUserFromVoiceRequest) {
    log.info("Received eject user request. meetingId=" + msg.meetingId + " userId=" + msg.userId)
    meeting.getUser(msg.userId) match {
      case Some(u) =>
        if (u.voiceUser.joinedVoice.value) {
          log.info("Ejecting user from voice.  meetingId=" + props.id + " userId=" + u.id)
          sender.sendEjectVoiceUserMessage(props.id, props.recorded, msg.ejectedBy, u.id,
            u.voiceUser.id, props.voiceConf)
        }

      case None => // do nothing
    }
  }

  def handleGetLockSettings(msg: GetLockSettings) {
    //println("*************** Reply with current lock settings ********************")
    //reusing the existing handle for NewPermissionsSettings to reply to the GetLockSettings request
    sender.sendNewPermissionsSettingMessage(props.id, msg.userId, meeting.getPermissions, meeting.getUsers)
  }

  def handleSetLockSettings(msg: SetLockSettings) {
    if (!permissionsEqual(msg.settings)) {
      newPermissions(msg.settings)
      sender.sendNewPermissionsSettingMessage(props.id, msg.setByUser, meeting.getPermissions, meeting.getUsers)
      handleLockLayout(msg.settings.lockedLayout, msg.setByUser)
    }
  }

  def handleLockUserRequest(msg: LockUserRequest) {
    meeting.getUser(msg.userId) match {
      case Some(u) =>
        val uvo = u.copy(locked = Locked(msg.lock))
        meeting.saveUser(uvo)

        log.info("Lock user.  meetingId=" + props.id + " userId=" + u.id + " lock=" + msg.lock)
        sender.sendUserLockedMessage(props.id, u.id, uvo.locked)

      case None =>
        log.info("Could not find user to lock.  meetingId=" + props.id + " userId=" + msg.userId + " lock=" + msg.lock)

    }
  }

  def handleInitLockSettings(msg: InitLockSettings) {
    if (!meeting.permisionsInitialized()) {
      meeting.initializePermissions()
      newPermissions(msg.settings)
      sender.sendPermissionsSettingInitializedMessage(msg.meetingId, msg.settings, meeting.getUsers)
    }
  }

  def handleInitAudioSettings(msg: InitAudioSettings) {
    if (!meeting.audioSettingsInitialized()) {
      meeting.initializeAudioSettings()

      if (meeting.isMeetingMuted != msg.muted) {
        handleMuteAllExceptPresenterRequest(new MuteAllExceptPresenterRequest(props.id, msg.requesterId, msg.muted));
      }
    }
  }

  def usersWhoAreNotPresenter(): Array[UserVO] = {
    val au = ArrayBuffer[UserVO]()

    meeting.getUsers foreach { u =>
      if (!u.presenter.value) {
        au += u
      }
    }
    au.toArray
  }

  def handleUserEmojiStatus(msg: UserEmojiStatus) {
    val userVO = changeUserEmojiStatus(msg.userId, msg.emojiStatus)

    userVO foreach { uvo =>
      sender.sendUserChangedEmojiStatusMessage(props.id, props.recorded, uvo.emojiStatus, uvo.id)
    }
  }

  def handleEjectUserFromMeeting(msg: EjectUserFromMeeting) {
    meeting.getUser(msg.userId) foreach { user =>
      if (user.voiceUser.joinedVoice.value) {
        sender.sendEjectVoiceUserMessage(props.id, props.recorded,
          msg.ejectedBy, msg.userId, user.voiceUser.id, props.voiceConf)
      }

      meeting.removeUser(msg.userId)
      meeting.removeRegisteredUser(msg.userId)

      log.info("Ejecting user from meeting.  meetingId=" + props.id + " userId=" + msg.userId)
      sender.sendUserEjectedFromMeetingMessage(props.id, props.recorded, msg.userId, msg.ejectedBy)
      sender.sendDisconnectUserMessage(props.id, msg.userId)
      sender.sendUserLeftMessage(msg.meetingId, props.recorded, user)
    }
  }

  def handleUserShareWebcam(msg: UserShareWebcam) {
    meeting.getUser(msg.userId) foreach { user =>
      val streams = user.webcamStreams + msg.stream
      val uvo = user.copy(hasStream = HasStream(true), webcamStreams = streams)
      meeting.saveUser(uvo)
      log.info("User shared webcam.  meetingId=" + props.id + " userId=" + uvo.id
        + " stream=" + msg.stream + " streams=" + streams)
      sender.sendUserSharedWebcamMessage(props.id, props.recorded, uvo.id, msg.stream)
    }
  }

  def handleUserunshareWebcam(msg: UserUnshareWebcam) {
    meeting.getUser(msg.userId) foreach { user =>
      val streamName = user.webcamStreams find (w => w == msg.stream) foreach { streamName =>
        val streams = user.webcamStreams - streamName
        val uvo = user.copy(hasStream = HasStream((!streams.isEmpty)), webcamStreams = streams)
        meeting.saveUser(uvo)
        log.info("User unshared webcam.  meetingId=" + props.id + " userId=" + uvo.id
          + " stream=" + msg.stream + " streams=" + streams)
        sender.sendUserUnsharedWebcamMessage(props.id, props.recorded, uvo.id, msg.stream)
      }
    }
  }

  def handleChangeUserStatus(msg: ChangeUserStatus): Unit = {
    if (meeting.hasUser(msg.userId)) {
      sender.sendUserStatusChangeMessage(props.id, props.recorded, msg.userId, msg.status, msg.value)
    }
  }

  def handleGetUsers(msg: GetUsers): Unit = {
    sender.sendGetUsersReplyMessage(msg.meetingId, msg.requesterId, meeting.getUsers)
  }

  def sendUserLeftEvent(user: UserVO) {
    val u = meeting.removeUser(user.id)
    sender.sendUserLeftMessage(props.id, props.recorded, user)
  }

  def handleUserJoin(msg: UserJoining): Unit = {
    log.debug("Received user joined meeting. metingId=" + props.id + " userId=" + msg.userId)

    val regUser = meeting.findWithToken(msg.token)
    val webUser = meeting.getUser(msg.userId)
    webUser foreach { wu =>
      if (!wu.joinedWeb.value) {
        /**
         * If user is not joined through the web (perhaps reconnecting).
         * Send a user left event to clear up user list of all clients.
         */
        sendUserLeftEvent(wu)
      }
    }

    regUser foreach { ru =>
      val voiceUser = initializeVoice(msg.userId, ru.name)
      val locked = getInitialLockStatus(ru.roles)
      val uvo = createNewUser(msg.userId, ru.extId, ru.name, ru.roles, voiceUser, getInitialLockStatus(ru.roles))

      log.info("User joined meeting. metingId=" + props.id + " userId=" + uvo.id + " user=" + uvo)

      sender.sendUserJoinedMessage(props.id, props.recorded, uvo)
      sender.sendMeetingStateMessage(props.id, props.recorded, uvo.id, meeting.getPermissions,
        Muted(meeting.isMeetingMuted))

      becomePresenterIfOnlyModerator(msg.userId, ru.name, ru.roles)
    }

    webUserJoined
    startRecordingIfAutoStart()
  }

  def handleUserJoin2(msg: UserJoining): Unit = {
    log.debug("Received user joined meeting. metingId=" + props.id + " userId=" + msg.userId)

    val regUser = meeting.findWithToken(msg.token)
    regUser foreach { ru =>
      log.debug("Found registered user. metingId=" + props.id + " userId=" + msg.userId + " ru=" + ru)

      val wUser = meeting.getUser(msg.userId)

      val vu = wUser match {
        case Some(u) =>
          log.debug("Found  user. metingId=" + props.id + " userId=" + msg.userId + " user=" + u)
          if (u.voiceUser.joinedVoice.value) {
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
            val callerId = CallerId(CallerIdName(ru.name.value), CallerIdNum(ru.name.value))
            new VoiceUser(u.voiceUser.id, msg.userId, callerId,
              joinedVoice = JoinedVoice(false), locked = Locked(false), muted = Muted(false),
              talking = Talking(false), listenOnly = u.listenOnly)
          }

        case None =>
          log.debug("User not found. metingId=" + props.id + " userId=" + msg.userId)
          /**
           * New user. Initialize voice status.
           */
          val callerId = CallerId(CallerIdName(ru.name.value), CallerIdNum(ru.name.value))
          new VoiceUser(VoiceUserId(msg.userId.value), msg.userId, callerId,
            joinedVoice = JoinedVoice(false), locked = Locked(false),
            muted = Muted(false), talking = Talking(false), listenOnly = ListenOnly(false))

      }

      wUser.foreach { w =>
        if (!w.joinedWeb.value) {
          log.debug("User is in voice only. Mark as user left. metingId=" + props.id + " userId=" + msg.userId)
          /**
           * If user is not joined through the web (perhaps reconnecting).
           * Send a user left event to clear up user list of all clients.
           */
          val user = meeting.removeUser(w.id)
          sender.sendUserLeftMessage(msg.meetingId, props.recorded, w)
        }
      }

      /**
       * Initialize the newly joined user copying voice status in case this
       * join is due to a reconnect.
       */
      val uvo = new UserVO(msg.userId, ru.extId, ru.name,
        ru.roles, emojiStatus = EmojiStatus("none"), presenter = IsPresenter(false),
        hasStream = HasStream(false), locked = Locked(getInitialLockStatus(ru.roles)),
        webcamStreams = new ListSet[String](), phoneUser = PhoneUser(false), vu,
        listenOnly = vu.listenOnly, joinedWeb = JoinedWeb(true))

      meeting.saveUser(uvo)

      log.info("User joined meeting. metingId=" + props.id + " userId=" + uvo.id + " user=" + uvo)

      sender.sendUserJoinedMessage(props.id, props.recorded, uvo)
      sender.sendMeetingStateMessage(props.id, props.recorded, uvo.id,
        meeting.getPermissions, Muted(meeting.isMeetingMuted))

      // Become presenter if the only moderator		
      if ((meeting.numModerators == 1) || (meeting.noPresenter())) {
        if (ru.roles.contains(Role.MODERATOR)) {
          assignNewPresenter(msg.userId, ru.name, msg.userId)
        }
      }
      webUserJoined
      startRecordingIfAutoStart()
    }
  }

  def handleUserLeft(msg: UserLeaving): Unit = {
    if (meeting.hasUser(msg.userId)) {
      val user = meeting.removeUser(msg.userId)
      user foreach { u =>
        log.info("User left meeting. meetingId=" + props.id + " userId=" + u.id + " user=" + u)
        sender.sendUserLeftMessage(msg.meetingId, props.recorded, u)

        if (u.presenter.value) {

          /* The current presenter has left the meeting. Find a moderator and make
	       * him presenter. This way, if there is a moderator in the meeting, there
	       * will always be a presenter.
	       */
          val moderator = meeting.findAModerator()
          moderator.foreach { mod =>
            log.info("Presenter left meeting.  meetingId=" + props.id + " userId=" + u.id
              + ". Making user=[" + mod.id + "] presenter.")
            assignNewPresenter(mod.id, mod.name, mod.id)
          }
        }

        val vu = u.voiceUser
        if (vu.joinedVoice.value || u.listenOnly.value) {
          /**
           * The user that left is still in the voice conference. Maybe this user just got disconnected
           * and is reconnecting. Make the user as joined only in the voice conference. If we get a
           * user left voice conference message, then we will remove the user from the users list.
           */
          switchUserToPhoneUser((new UserJoinedVoiceConfMessage(props.voiceConf,
            vu.id, u.id, u.extId, vu.callerId,
            vu.muted, vu.talking, u.listenOnly)));
        }

        checkCaptionOwnerLogOut(u.id.value)
      }

      startCheckingIfWeNeedToEndVoiceConf()
      stopAutoStartedRecording()
    }
  }

  def getInitialLockStatus(roles: Set[String]): Boolean = {
    meeting.getPermissions.lockOnJoin && !(roles.contains(Role.MODERATOR))
  }

  def handleUserJoinedVoiceFromPhone(msg: UserJoinedVoiceConfMessage) = {
    log.info("User joining from phone.  meetingId=" + props.id + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    val user = meeting.getUserWithVoiceUserId(msg.voiceUserId) match {
      case Some(user) =>
        log.info("Voice user=" + msg.voiceUserId + " is already in conf="
          + props.voiceConf + ". Must be duplicate message. meetigId=" + props.id)

      case None =>
        val webUserId = if (msg.userId.value != msg.callerId.name.value) {
          msg.userId
        } else {
          // No current web user. This means that the user called in through
          // the phone. We need to generate a new user as we are not able
          // to match with a web user.
          meeting.generateWebUserId(meeting.getUsers)
        }

        /**
         * If user is not joined listenOnly then user is joined calling through phone or webrtc.
         */
        val vu = new VoiceUser(msg.voiceUserId, webUserId, msg.callerId,
          joinedVoice = JoinedVoice(!msg.listenOnly.value), locked = Locked(false),
          muted = msg.muted, talking = msg.talking, listenOnly = msg.listenOnly)

        /**
         * If user is not joined listenOnly then user is joined calling through phone or webrtc.
         * So we call him "phoneUser".
         */
        val uvo = new UserVO(webUserId, msg.externUserId, Name(msg.callerId.name.value),
          Set(Role.VIEWER), emojiStatus = EmojiStatus("none"), presenter = IsPresenter(false),
          hasStream = HasStream(false), locked = Locked(getInitialLockStatus(Set(Role.VIEWER))),
          webcamStreams = new ListSet[String](),
          phoneUser = PhoneUser(!(msg.listenOnly.value)), vu, listenOnly = msg.listenOnly,
          joinedWeb = JoinedWeb(false))

        meeting.saveUser(uvo)

        log.info("User joined from phone.  meetingId=" + props.id + " userId=" + uvo.id + " user=" + uvo)
        sender.sendUserJoinedMessage(props.id, props.recorded, uvo)
        sender.sendUserJoinedVoiceMessage(props.id, props.recorded, props.voiceConf, uvo)

        if (meeting.isMeetingMuted) {
          sender.sendMuteVoiceUserMessage(props.id, props.recorded, uvo.id, uvo.id,
            vu.id, props.voiceConf, meeting.isMeetingMuted)
        }

    }
  }

  def startRecordingVoiceConference() {
    if (meeting.numUsersInVoiceConference == 1 && props.recorded.value && !meeting.isVoiceRecording) {
      meeting.startRecordingVoice()
      log.info("Send START RECORDING voice conf. meetingId=" + props.id + " voice conf=" + props.voiceConf)
      sender.sendStartRecordingVoiceConf(props.id, props.recorded, props.voiceConf)
    }
  }

  def switchUserToPhoneUser(msg: UserJoinedVoiceConfMessage) = {
    log.info("User has been disconnected but still in voice conf. Switching to phone user. meetingId="
      + props.id + " callername=" + msg.callerId.name
      + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    meeting.getUser(msg.userId) match {
      case Some(user) =>
        val vu = new VoiceUser(msg.voiceUserId, msg.userId, msg.callerId,
          joinedVoice = JoinedVoice(true), locked = Locked(false),
          muted = msg.muted, talking = msg.talking, listenOnly = msg.listenOnly)
        val nu = user.copy(voiceUser = vu, listenOnly = msg.listenOnly)
        meeting.saveUser(nu)

        log.info("User joined voice. meetingId=" + props.id + " userId=" + user.id + " user=" + nu)
        sender.sendUserJoinedVoiceMessage(props.id, props.recorded, props.voiceConf, nu)

        if (meeting.isMeetingMuted) {
          sender.sendMuteVoiceUserMessage(props.id, props.recorded, nu.id, nu.id,
            nu.voiceUser.id, props.voiceConf, meeting.isMeetingMuted)
        }

      case None =>
        handleUserJoinedVoiceFromPhone(msg)

    }
  }

  def handleUserJoinedVoiceConfMessage(msg: UserJoinedVoiceConfMessage) = {
    log.info("Received user joined voice. meetingId=" + props.id + " callername=" + msg.callerId.name
      + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    meeting.getUser(msg.userId) match {
      case Some(user) =>
        // this is used to restore the mute state on reconnect
        val previouslyMuted = user.voiceUser.muted

        val vu = new VoiceUser(msg.voiceUserId, msg.userId, msg.callerId,
          joinedVoice = JoinedVoice(true), locked = Locked(false),
          muted = msg.muted, talking = msg.talking, listenOnly = msg.listenOnly)
        val nu = user.copy(voiceUser = vu, listenOnly = msg.listenOnly)
        meeting.saveUser(nu)

        log.info("User joined voice. meetingId=" + props.id + " userId=" + user.id + " user=" + nu)

        sender.sendUserJoinedVoiceMessage(props.id, props.recorded, props.voiceConf, nu)

        if (meeting.isMeetingMuted || previouslyMuted.value) {
          sender.sendMuteVoiceUserMessage(props.id, props.recorded, nu.id, nu.id,
            nu.voiceUser.id, props.voiceConf, true)
        }

        startRecordingVoiceConference()

      case None =>
        handleUserJoinedVoiceFromPhone(msg)
        startRecordingVoiceConference()

    }
  }

  def stopRecordingVoiceConference() {
    if (meeting.numUsersInVoiceConference == 0 && props.recorded.value && meeting.isVoiceRecording) {
      meeting.stopRecordingVoice()
      log.info("Send STOP RECORDING voice conf. meetingId=" + props.id + " voice conf=" + props.voiceConf)
      sender.sendStopRecordingVoiceConf(props.id, props.recorded,
        props.voiceConf, meeting.getVoiceRecordingFilename)
    }
  }

  def handleUserLeftVoiceConfMessage(msg: UserLeftVoiceConfMessage) {
    log.info("Received user left voice conf. meetingId=" + props.id + " voice conf=" + msg.voiceConfId
      + " userId=" + msg.voiceUserId)

    meeting.getUserWithVoiceUserId(msg.voiceUserId) foreach { user =>
      /**
       * Reset user's voice status.
       */
      val callerId = CallerId(CallerIdName(user.name.value), CallerIdNum(user.name.value))
      val vu = new VoiceUser(VoiceUserId(user.id.value), user.id, callerId,
        joinedVoice = JoinedVoice(false), locked = Locked(false),
        muted = Muted(false), talking = Talking(false), listenOnly = ListenOnly(false))
      val nu = user.copy(voiceUser = vu, phoneUser = PhoneUser(false), listenOnly = ListenOnly(false))
      meeting.saveUser(nu)

      log.info("User left voice conf. meetingId=" + props.id + " userId=" + nu.id + " user=" + nu)

      sender.sendUserLeftVoiceMessage(props.id, props.recorded, props.voiceConf, nu)
      if (user.phoneUser.value) {
        if (meeting.hasUser(user.id)) {
          val userLeaving = meeting.removeUser(user.id)
          userLeaving foreach (u => outGW.send(new UserLeft(props.id, props.recorded, u)))
        }
      }

      stopRecordingVoiceConference()
    }
  }

  def handleUserMutedInVoiceConfMessage(msg: UserMutedInVoiceConfMessage) {
    meeting.getUserWithVoiceUserId(msg.voiceUserId) foreach { user =>
      val talking: Boolean = if (msg.muted) false else user.voiceUser.talking.value
      val nv = user.voiceUser.copy(muted = Muted(msg.muted), talking = Talking(talking))
      val nu = user.copy(voiceUser = nv)
      meeting.saveUser(nu)

      log.info("User muted in voice conf. meetingId=" + props.id + " userId=" + nu.id + " user=" + nu)
      sender.sendUserVoiceMutedMessage(props.id, props.recorded, props.voiceConf, nu)
    }
  }

  def handleUserTalkingInVoiceConfMessage(msg: UserTalkingInVoiceConfMessage) {
    meeting.getUserWithVoiceUserId(msg.voiceUserId) foreach { user =>
      val nv = user.voiceUser.copy(talking = Talking(msg.talking))
      val nu = user.copy(voiceUser = nv)
      meeting.saveUser(nu)
      //      println("Received voice talking=[" + msg.talking + "] wid=[" + msg.userId + "]" )
      sender.sendUserVoiceTalkingMessage(props.id, props.recorded, props.voiceConf, nu)
    }
  }

  def handleAssignPresenter(msg: AssignPresenter): Unit = {
    assignNewPresenter(msg.newPresenterId, msg.newPresenterName, msg.assignedBy)
  }

  def assignNewPresenter(newPresenterId: IntUserId, newPresenterName: Name, assignedBy: IntUserId) {
    // Stop poll if one is running as presenter left.
    handleStopPollRequest(StopPollRequest(props.id, assignedBy))

    if (meeting.hasUser(newPresenterId)) {

      meeting.getCurrentPresenter match {
        case Some(curPres) =>
          meeting.unbecomePresenter(curPres.id.value)
          sender.sendUserStatusChangeMessage(props.id, props.recorded, curPres.id, false)

        case None => // do nothing
      }

      meeting.getUser(newPresenterId) match {
        case Some(newPres) =>
          meeting.becomePresenter(newPres.id)
          meeting.setCurrentPresenterInfo(new Presenter(newPresenterId, newPresenterName, assignedBy))
          sender.sendPresenterAssignedMessage(props.id, props.recorded, new Presenter(newPresenterId, newPresenterName, assignedBy))
          sender.sendUserStatusChangeMessage(props.id, props.recorded, newPresenterId, true)

        case None => // do nothing
      }

    }
  }
}
