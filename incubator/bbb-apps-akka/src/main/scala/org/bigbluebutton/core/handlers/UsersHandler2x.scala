package org.bigbluebutton.core.handlers

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.domain._
import org.bigbluebutton.core.models.{ MeetingStateModel, PinNumberGenerator, RegisteredUsers2x, Users3x }

trait UsersHandler2x {
  val state: MeetingStateModel
  val outGW: OutMessageGateway

  private var userHandlers = new collection.immutable.HashMap[String, UserActorMessageHandler]

  def handleRegisterUser2x(msg: RegisterUser2xCommand): Unit = {
    val pinNumber = PinNumberGenerator.generatePin(state.props.voiceConf, state.status.get)
    val regUser = RegisteredUsers2x.create(
      msg.userId,
      msg.extUserId,
      msg.name,
      msg.roles,
      msg.authToken,
      msg.avatar,
      msg.logoutUrl,
      msg.welcome,
      msg.dialNumbers,
      pinNumber,
      msg.config,
      msg.extData)

    state.registeredUsers.add(regUser)
    outGW.send(new UserRegisteredEvent2x(state.props.id, state.props.recordingProp.recorded, regUser))
  }

  def handleValidateAuthToken2x(msg: ValidateAuthToken): Unit = {
    def handle(regUser: RegisteredUser2x): Unit = {
      val userHandler = new UserActorMessageHandler(regUser, outGW)
      userHandlers += msg.userId.value -> userHandler
      userHandler.handleValidateAuthToken2x(msg, state)
    }

    for {
      regUser <- RegisteredUsers2x.findWithToken(msg.token, state.registeredUsers.toVector)
    } yield handle(regUser)

  }

  def handleUserJoinWeb2x(msg: NewUserPresence2x): Unit = {

    // Check if there is a registered user with token
    // Check if there is a user already in the list of users, if so, might be a reconnect
    // Compare sessionId, if sessionId is not same then this is a reconnect
    // Just update the sessionId and send join success

    userHandlers.get(msg.userId.value) foreach { handler => handler.handleUserJoinWeb2x(msg, state) }

    // TODO: Keep track if there are still web users in the meeting.
    //          if (Users2x.numberOfWebUsers(meeting.state.users.toVector) > 0) {
    //            meeting.resetLastWebUserLeftOn()
    //          }

    // TODO: Start recording when first user joins meeting
    //          if (needToStartRecording(meeting)) {
    //            meeting.recordingStarted()
    //     sender.send(new RecordingStatusChanged(props.id, props.recorded, IntUserId("system"), meeting.isRecording))
    //          }

  }

  def handleUserLeave2xCommand(msg: UserLeave2xCommand): Unit = {
    userHandlers.get(msg.userId.value) foreach { handler => handler.handleUserLeave2xCommand(msg, state) }

    //    if (meeting.hasUser(msg.userId)) {
    //      val user = meeting.removeUser(msg.userId)
    //      user foreach { u =>
    //        log.info("User left meeting. meetingId=" + props.id + " userId=" + u.id + " user=" + u)
    //        sender.sendUserLeftMessage(msg.meetingId, props.recorded, u)

    //        if (u.presenter.value) {

    /* The current presenter has left the meeting. Find a moderator and make
	       * him presenter. This way, if there is a moderator in the meeting, there
	       * will always be a presenter.
	       */
    //          val moderator = meeting.findAModerator()
    //          moderator.foreach { mod =>
    //            log.info("Presenter left meeting.  meetingId=" + props.id + " userId=" + u.id
    //              + ". Making user=[" + mod.id + "] presenter.")
    //            assignNewPresenter(mod.id, mod.name, mod.id)
    //          }
    //        }

    //        val vu = u.voiceUser
    //        if (vu.joinedVoice.value || u.listenOnly.value) {
    /**
     * The user that left is still in the voice conference. Maybe this user just got disconnected
     * and is reconnecting. Make the user as joined only in the voice conference. If we get a
     * user left voice conference message, then we will remove the user from the users list.
     */
    //          switchUserToPhoneUser((new UserJoinedVoiceConfMessage(props.voiceConf,
    //            vu.id, u.id, u.extId, vu.callerId,
    //            vu.muted, vu.talking, u.listenOnly)));
    //        }

    //        checkCaptionOwnerLogOut(u.id.value)
    //      }

    //      startCheckingIfWeNeedToEndVoiceConf()
    //      stopAutoStartedRecording()
    //    }
  }

  def handleViewWebCamRequest2x(msg: ViewWebCamRequest2x) {
    userHandlers.get(msg.userId.value) foreach { handler => handler.handleViewWebCamRequest2x(msg, state) }

    /*    meeting.getUser(msg.userId) foreach { user =>
      val streams = user.webcamStreams + msg.stream
      val uvo = user.copy(hasStream = HasStream(true), webcamStreams = streams)
      meeting.saveUser(uvo)
      log.info("User shared webcam.  meetingId=" + props.id + " userId=" + uvo.id
        + " stream=" + msg.stream + " streams=" + streams)
      sender.sendUserSharedWebcamMessage(props.id, props.recorded, uvo.id, msg.stream)
    }
*/ }

  def handleShareWebCamRequest2x(msg: ShareWebCamRequest2x) {
    userHandlers.get(msg.userId.value) foreach { handler => handler.handleShareWebCamRequest2x(msg, state) }

    /*    meeting.getUser(msg.userId) foreach { user =>
      val streams = user.webcamStreams + msg.stream
      val uvo = user.copy(hasStream = HasStream(true), webcamStreams = streams)
      meeting.saveUser(uvo)
      log.info("User shared webcam.  meetingId=" + props.id + " userId=" + uvo.id
        + " stream=" + msg.stream + " streams=" + streams)
      sender.sendUserSharedWebcamMessage(props.id, props.recorded, uvo.id, msg.stream)
    }
*/ }

  def handleUserShareWebCam2x(msg: UserShareWebCam2x) {
    userHandlers.get(msg.userId.value) foreach { handler => handler.handleUserShareWebCam2x(msg, state) }

    /*    meeting.getUser(msg.userId) foreach { user =>
      val streams = user.webcamStreams + msg.stream
      val uvo = user.copy(hasStream = HasStream(true), webcamStreams = streams)
      meeting.saveUser(uvo)
      log.info("User shared webcam.  meetingId=" + props.id + " userId=" + uvo.id
        + " stream=" + msg.stream + " streams=" + streams)
      sender.sendUserSharedWebcamMessage(props.id, props.recorded, uvo.id, msg.stream)
    }
*/ }

  def handleUserUnShareWebCam2x(msg: UserUnShareWebCam2x) {
    userHandlers.get(msg.userId.value) foreach { handler => handler.handleUserUnShareWebCam2x(msg, state) }
    /*    meeting.getUser(msg.userId) foreach { user =>
      val streamName = user.webcamStreams find (w => w == msg.stream) foreach { streamName =>
        val streams = user.webcamStreams - streamName
        val uvo = user.copy(hasStream = HasStream((!streams.isEmpty)), webcamStreams = streams)
        meeting.saveUser(uvo)
        log.info("User unshared webcam.  meetingId=" + props.id + " userId=" + uvo.id
          + " stream=" + msg.stream + " streams=" + streams)
        sender.sendUserUnsharedWebcamMessage(props.id, props.recorded, uvo.id, msg.stream)
      }
    }
*/ }

  def handleUserJoinedVoiceConfListenOnly(msg: UserJoinedVoiceConf): Unit = {
    /*    def createVoice(user: User3x): Voice4x = {
      Voice4x(msg.voice.id, joined = JoinedVoice(true), msg.voice.userAgent, msg.voice.callerId,
        msg.voice.listenDirection, msg.voice.talkDirection, msg.voice.muted, msg.voice.talking)
    }

    def update(user: User3x, presence: Presence2x, voice: Voice4x): User3x = {
      val newPresence = Presence2x.save(presence, voice)
      User3x.update(presence, user, newPresence)
    }

    def sendMessage(user: User3x, voice: Voice4x): Unit = {
      sender.sendUserListeningOnlyMessage(meeting.props.id, meeting.props.recorded, user.id, msg.presenceId, voice)
    }

    def saveAndSend(user: User3x, voice: Voice4x): Unit = {
      meeting.state.users.save(user)
      sendMessage(user, voice)
    }

    for {
      user <- meeting.state.users.findWithId(msg.userId)
      presence <- User3x.findWithPresenceId(user.presence, msg.presenceId)
      voice = createVoice(user)
      newUser = update(user, presence, voice)
    } yield saveAndSend(newUser, voice)
*/
  }

  def handleUserLeftVoiceConfListenOnly(msg: UserLeftVoiceConf): Unit = {
    /*    def saveAndSend(user: User3x, voice: Voice4x): Unit = {
      meeting.state.users.save(user)
      sendMessage(user, voice)
    }

    def sendMessage(user: User3x, voice: Voice4x): Unit = {
      sender.sendUserListeningOnlyMessage(meeting.props.id, meeting.props.recorded, user.id, msg.presenceId, voice)
    }

    def remove(user: User3x, presence: Presence2x, voice: Voice4x): User3x = {
      val newPresence = Presence2x.save(presence, voice)
      User3x.update(presence, user, newPresence)
    }

    for {
      user <- meeting.state.users.findWithId(msg.userId)
      presence <- User3x.findWithPresenceId(user.presence, msg.presenceId)
      newUser = remove(user, presence, presence.voice)
    } yield saveAndSend(newUser, presence.voice)
*/ }

  def handleMuteAllExceptPresenterRequest(msg: MuteAllExceptPresenterRequest): Unit = {
    /*
    def findNonPresenters: Vector[User3x] = {
      meeting.state.users.toVector.filterNot(u => u.roles.contains(PresenterRole))
    }

    def findNonListenOnlyPresence(user: User3x): Set[Presence2x] = {
      user.presence.filter(p => p.voice.listenDirection.value == true && p.voice.talkDirection.value == true)
    }

    findNonPresenters foreach { u =>
      val presence = findNonListenOnlyPresence(u)
      presence foreach { p =>
        sender.sendMuteVoiceUserMessage(meeting.props.id, meeting.props.recorded, u.id, msg.requesterId,
          p.voice.id, meeting.props.voiceConf, msg.mute)
      }
    }
*/ }

  def handleMuteMeetingRequest(msg: MuteMeetingRequest): Unit = {
    /*    def findNonListenOnlyPresence(user: User3x): Set[Presence2x] = {
      user.presence.filter(p => p.voice.listenDirection.value == true && p.voice.talkDirection.value == true)
    }

    meeting.state.users.toVector foreach { u =>
      val presence = findNonListenOnlyPresence(u)
      presence foreach { p =>
        sender.sendMuteVoiceUserMessage(meeting.props.id, meeting.props.recorded, u.id, msg.requesterId,
          p.voice.id, meeting.props.voiceConf, msg.mute)
      }
    }
*/ }

  def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
    //    sender.sendIsMeetingMutedReplyMessage(props.id, props.recorded, msg.requesterId, meeting.isMeetingMuted)
  }

  def handleMuteUserRequest(msg: MuteUserRequest) {
    /*
    def isMutable(voice: Voice4x): Boolean = {
      voice.joined.value && !voice.muted.value && voice.listenDirection.value && voice.talkDirection.value
    }

    def sendMuteUser(presence: Set[Presence2x]): Unit = {
      // TODO: Send mute voice user
      //     sender.sendMuteVoiceUserMessage(meeting.props.id, meeting.props.recorded, presence.voice.id, msg.requesterId,
      //       presence.voice.id, meeting.props.voiceConf, msg.mute)
    }

    for {
      user <- meeting.state.users.findWithId(msg.userId)
      presence = user.presence.filter(p => isMutable(p.voice))
    } yield sendMuteUser(presence)
*/ }

  def handleEjectUserFromVoiceRequest(msg: EjectUserFromVoiceRequest) {
    /*
    def removeAndEject(user: User3x): Unit = {
      meeting.state.users.remove(user.id)
      // TODO: Send Eject user from voice
      //      sender.sendEjectVoiceUserMessage(props.id, props.recorded, msg.ejectedBy, u.id,
      //        u.voiceUser.id, props.voiceConf)
    }

    for {
      user <- meeting.state.users.findWithId(msg.userId)
      // TODO: Get all the presence with voice. Go through them and eject one by one.
      // What to do with listen only??
    } yield removeAndEject(user)
*/ }

  def handleGetLockSettings(msg: GetLockSettings) {
    //println("*************** Reply with current lock settings ********************")
    //reusing the existing handle for NewPermissionsSettings to reply to the GetLockSettings request
    //    sender.sendNewPermissionsSettingMessage(props.id, msg.userId, meeting.getPermissions, meeting.getUsers)
  }

  def handleSetLockSettings(msg: SetLockSettings) {
    /*    if (!permissionsEqual(msg.settings)) {
      newPermissions(msg.settings)
      sender.sendNewPermissionsSettingMessage(props.id, msg.setByUser, meeting.getPermissions, meeting.getUsers)
      handleLockLayout(msg.settings.lockedLayout, msg.setByUser)
    }
*/ }

  def handleLockUserRequest(msg: LockUserRequest) {
    /*    meeting.getUser(msg.userId) match {
      case Some(u) =>
        val uvo = u.copy(locked = Locked(msg.lock))
        meeting.saveUser(uvo)

        log.info("Lock user.  meetingId=" + props.id + " userId=" + u.id + " lock=" + msg.lock)
        sender.sendUserLockedMessage(props.id, u.id, uvo.locked)

      case None =>
        log.info("Could not find user to lock.  meetingId=" + props.id + " userId=" + msg.userId + " lock=" + msg.lock)

    }
*/ }

  def handleInitLockSettings(msg: InitLockSettings) {
    /*    if (!meeting.permisionsInitialized()) {
      meeting.initializePermissions()
      newPermissions(msg.settings)
      sender.sendPermissionsSettingInitializedMessage(msg.meetingId, msg.settings, meeting.getUsers)
    }
*/ }

  def handleInitAudioSettings(msg: InitAudioSettings) {
    /*    if (!meeting.audioSettingsInitialized()) {
      meeting.initializeAudioSettings()

      if (meeting.isMeetingMuted != msg.muted) {
        handleMuteAllExceptPresenterRequest(new MuteAllExceptPresenterRequest(props.id, msg.requesterId, msg.muted));
      }
    }
*/ }

  def handleUserEmojiStatus(msg: UserEmojiStatus) {
    /*
    def saveAndSend(user: User3x): Unit = {
      meeting.state.users.save(user)
      // TODO:
      //     sender.sendUserChangedEmojiStatusMessage(props.id, props.recorded, uvo.emojiStatus, uvo.id)
    }
    for {
      user <- meeting.state.users.findWithId(msg.userId)
      newUser = User3x.update(user, msg.emojiStatus)
    } yield saveAndSend(user)
*/ }

  def handleEjectUserFromMeeting(msg: EjectUserFromMeeting) {
    def removeAndEject(user: User3x): Unit = {
      // remove user from list of users
      state.users.remove(user.id)
      // remove user from registered users to prevent re-joining
      state.registeredUsers.remove(msg.userId)

      // Send message to user that he has been ejected.
      outGW.send(new UserEjectedFromMeeting(state.props.id,
        state.props.recordingProp.recorded,
        msg.userId, msg.ejectedBy))
      // Tell system to disconnect user.
      outGW.send(new DisconnectUser2x(msg.meetingId, msg.userId))
      // Tell all others that user has left the meeting.
      outGW.send(new UserLeft2x(state.props.id,
        state.props.recordingProp.recorded,
        msg.userId))
    }

    for {
      user <- Users3x.findWithId(msg.userId, state.users.toVector)
    } yield removeAndEject(user)
  }

  def handleChangeUserStatus(msg: ChangeUserStatus): Unit = {
    //    if (meeting.hasUser(msg.userId)) {
    //      sender.sendUserStatusChangeMessage(props.id, props.recorded, msg.userId, msg.status, msg.value)
    //    }
  }

  def handleGetUsers(msg: GetUsers): Unit = {
    //    sender.sendGetUsersReplyMessage(msg.meetingId, msg.requesterId, meeting.getUsers)
  }

  def sendUserLeftEvent(user: UserVO) {
    //    val u = meeting.removeUser(user.id)
    //    sender.sendUserLeftMessage(props.id, props.recorded, user)
  }

  def handleUserJoin2(msg: UserJoining): Unit = {
    //    log.debug("Received user joined meeting. metingId=" + props.id + " userId=" + msg.userId)

    //    val regUser = meeting.findWithToken(msg.token)
    //    regUser foreach { ru =>
    //      log.debug("Found registered user. metingId=" + props.id + " userId=" + msg.userId + " ru=" + ru)

    //      val wUser = meeting.getUser(msg.userId)

    //      val vu = wUser match {
    //        case Some(u) =>
    //          log.debug("Found  user. metingId=" + props.id + " userId=" + msg.userId + " user=" + u)
    //          if (u.voiceUser.joinedVoice.value) {
    /*
             * User is in voice conference. Must mean that the user reconnected with audio
             * still in the voice conference.
             */
    //            u.voiceUser.copy()
    //          } else {
    /**
     * User is not joined in voice conference. Initialize user and copy status
     * as user maybe joined listenOnly.
     */
    //            val callerId = CallerId(CallerIdName(ru.name.value), CallerIdNum(ru.name.value))
    //            new VoiceUser(u.voiceUser.id, msg.userId, callerId,
    //              joinedVoice = JoinedVoice(false), locked = Locked(false), muted = Muted(false),
    //              talking = Talking(false), listenOnly = u.listenOnly)
    //          }

    //        case None =>
    //          log.debug("User not found. metingId=" + props.id + " userId=" + msg.userId)
    /**
     * New user. Initialize voice status.
     */
    //          val callerId = CallerId(CallerIdName(ru.name.value), CallerIdNum(ru.name.value))
    //          new VoiceUser(VoiceUserId(msg.userId.value), msg.userId, callerId,
    //            joinedVoice = JoinedVoice(false), locked = Locked(false),
    //            muted = Muted(false), talking = Talking(false), listenOnly = ListenOnly(false))

    //      }

    //      wUser.foreach { w =>
    //        if (!w.joinedWeb.value) {
    //          log.debug("User is in voice only. Mark as user left. metingId=" + props.id + " userId=" + msg.userId)
    /**
     * If user is not joined through the web (perhaps reconnecting).
     * Send a user left event to clear up user list of all clients.
     */
    //          val user = meeting.removeUser(w.id)
    //          sender.sendUserLeftMessage(msg.meetingId, props.recorded, w)
    //        }
    //      }

    /**
     * Initialize the newly joined user copying voice status in case this
     * join is due to a reconnect.
     */
    //      val uvo = new UserVO(msg.userId, ru.extId, ru.name,
    //        ru.roles, emojiStatus = EmojiStatus("none"), presenter = IsPresenter(false),
    //        hasStream = HasStream(false), locked = Locked(getInitialLockStatus(ru.roles)),
    //        webcamStreams = new ListSet[String](), phoneUser = PhoneUser(false), vu,
    //        listenOnly = vu.listenOnly, joinedWeb = JoinedWeb(true))

    //      meeting.saveUser(uvo)

    //      log.info("User joined meeting. metingId=" + props.id + " userId=" + uvo.id + " user=" + uvo)

    //      sender.sendUserJoinedMessage(props.id, props.recorded, uvo)
    //      sender.sendMeetingStateMessage(props.id, props.recorded, uvo.id,
    //        meeting.getPermissions, Muted(meeting.isMeetingMuted))

    // Become presenter if the only moderator
    //      if ((meeting.numModerators == 1) || (meeting.noPresenter())) {
    //        if (ru.roles.contains(Role.MODERATOR)) {
    //          assignNewPresenter(msg.userId, ru.name, msg.userId)
    //        }
    //      }
    //      webUserJoined
    //      startRecordingIfAutoStart()
    //    }
  }

  def getInitialLockStatus(roles: Set[String]): Boolean = {
    //    meeting.getPermissions.lockOnJoin && !(roles.contains(Role.MODERATOR))
    true
  }

  def handleUserJoinedVoiceFromPhone(msg: UserJoinedVoiceConfMessage) = {
    //    log.info("User joining from phone.  meetingId=" + props.id + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    //    val user = meeting.getUserWithVoiceUserId(msg.voiceUserId) match {
    //      case Some(user) =>
    //        log.info("Voice user=" + msg.voiceUserId + " is already in conf="
    //          + props.voiceConf + ". Must be duplicate message. meetigId=" + props.id)

    //      case None =>
    //        val webUserId = if (msg.userId.value != msg.callerId.name.value) {
    //          msg.userId
    //        } else {
    // No current web user. This means that the user called in through
    // the phone. We need to generate a new user as we are not able
    // to match with a web user.
    //          meeting.generateWebUserId(meeting.getUsers)
    //        }

    /**
     * If user is not joined listenOnly then user is joined calling through phone or webrtc.
     */
    //        val vu = new VoiceUser(msg.voiceUserId, webUserId, msg.callerId,
    //          joinedVoice = JoinedVoice(!msg.listenOnly.value), locked = Locked(false),
    //          muted = msg.muted, talking = msg.talking, listenOnly = msg.listenOnly)

    /**
     * If user is not joined listenOnly then user is joined calling through phone or webrtc.
     * So we call him "phoneUser".
     */
    //        val uvo = new UserVO(webUserId, msg.externUserId, Name(msg.callerId.name.value),
    //          Set(Role.VIEWER), emojiStatus = EmojiStatus("none"), presenter = IsPresenter(false),
    //          hasStream = HasStream(false), locked = Locked(getInitialLockStatus(Set(Role.VIEWER))),
    //          webcamStreams = new ListSet[String](),
    //          phoneUser = PhoneUser(!(msg.listenOnly.value)), vu, listenOnly = msg.listenOnly,
    //          joinedWeb = JoinedWeb(false))

    //        meeting.saveUser(uvo)

    //        log.info("User joined from phone.  meetingId=" + props.id + " userId=" + uvo.id + " user=" + uvo)
    //        sender.sendUserJoinedMessage(props.id, props.recorded, uvo)
    //        sender.sendUserJoinedVoiceMessage(props.id, props.recorded, props.voiceConf, uvo)

    //        if (meeting.isMeetingMuted) {
    //          sender.sendMuteVoiceUserMessage(props.id, props.recorded, uvo.id, uvo.id,
    //           vu.id, props.voiceConf, meeting.isMeetingMuted)
    //        }

    //    }
  }

  def startRecordingVoiceConference() {
    //    if (meeting.numUsersInVoiceConference == 1 && props.recorded.value && !meeting.isVoiceRecording) {
    //      meeting.startRecordingVoice()
    //      log.info("Send START RECORDING voice conf. meetingId=" + props.id + " voice conf=" + props.voiceConf)
    //      sender.sendStartRecordingVoiceConf(props.id, props.recorded, props.voiceConf)
    //    }
  }

  def switchUserToPhoneUser(msg: UserJoinedVoiceConfMessage) = {
    //    log.info("User has been disconnected but still in voice conf. Switching to phone user. meetingId="
    //      + props.id + " callername=" + msg.callerId.name
    //      + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    //    meeting.getUser(msg.userId) match {
    //      case Some(user) =>
    //        val vu = new VoiceUser(msg.voiceUserId, msg.userId, msg.callerId,
    //          joinedVoice = JoinedVoice(true), locked = Locked(false),
    //          muted = msg.muted, talking = msg.talking, listenOnly = msg.listenOnly)
    //        val nu = user.copy(voiceUser = vu, listenOnly = msg.listenOnly)
    //        meeting.saveUser(nu)

    //        log.info("User joined voice. meetingId=" + props.id + " userId=" + user.id + " user=" + nu)
    //        sender.sendUserJoinedVoiceMessage(props.id, props.recorded, props.voiceConf, nu)

    //        if (meeting.isMeetingMuted) {
    //          sender.sendMuteVoiceUserMessage(props.id, props.recorded, nu.id, nu.id,
    //            nu.voiceUser.id, props.voiceConf, meeting.isMeetingMuted)
    //        }

    //      case None =>
    //        handleUserJoinedVoiceFromPhone(msg)

    //    }
  }

  def handleUserJoinedVoiceConfMessage(msg: UserJoinedVoiceConfMessage) = {
    //    log.info("Received user joined voice. meetingId=" + props.id + " callername=" + msg.callerId.name
    //      + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    //    meeting.getUser(msg.userId) match {
    //      case Some(user) =>
    // this is used to restore the mute state on reconnect
    //        val previouslyMuted = user.voiceUser.muted

    //        val vu = new VoiceUser(msg.voiceUserId, msg.userId, msg.callerId,
    //          joinedVoice = JoinedVoice(true), locked = Locked(false),
    //          muted = msg.muted, talking = msg.talking, listenOnly = msg.listenOnly)
    //        val nu = user.copy(voiceUser = vu, listenOnly = msg.listenOnly)
    //        meeting.saveUser(nu)

    //        log.info("User joined voice. meetingId=" + props.id + " userId=" + user.id + " user=" + nu)

    //        sender.sendUserJoinedVoiceMessage(props.id, props.recorded, props.voiceConf, nu)

    //        if (meeting.isMeetingMuted || previouslyMuted.value) {
    //          sender.sendMuteVoiceUserMessage(props.id, props.recorded, nu.id, nu.id,
    //            nu.voiceUser.id, props.voiceConf, true)
    //        }

    //        startRecordingVoiceConference()

    //      case None =>
    //        handleUserJoinedVoiceFromPhone(msg)
    //        startRecordingVoiceConference()
    //
    //    }
  }

  def stopRecordingVoiceConference() {
    //    if (meeting.numUsersInVoiceConference == 0 && props.recorded.value && meeting.isVoiceRecording) {
    //      meeting.stopRecordingVoice()
    //      log.info("Send STOP RECORDING voice conf. meetingId=" + props.id + " voice conf=" + props.voiceConf)
    //      sender.sendStopRecordingVoiceConf(props.id, props.recorded,
    //        props.voiceConf, meeting.getVoiceRecordingFilename)
    //    }
  }

  def handleUserLeftVoiceConfMessage(msg: UserLeftVoiceConfMessage) {
    //    log.info("Received user left voice conf. meetingId=" + props.id + " voice conf=" + msg.voiceConfId
    //      + " userId=" + msg.voiceUserId)

    //    meeting.getUserWithVoiceUserId(msg.voiceUserId) foreach { user =>
    /**
     * Reset user's voice status.
     */
    //      val callerId = CallerId(CallerIdName(user.name.value), CallerIdNum(user.name.value))
    //      val vu = new VoiceUser(VoiceUserId(user.id.value), user.id, callerId,
    //        joinedVoice = JoinedVoice(false), locked = Locked(false),
    //        muted = Muted(false), talking = Talking(false), listenOnly = ListenOnly(false))
    //      val nu = user.copy(voiceUser = vu, phoneUser = PhoneUser(false), listenOnly = ListenOnly(false))
    //      meeting.saveUser(nu)

    //      log.info("User left voice conf. meetingId=" + props.id + " userId=" + nu.id + " user=" + nu)

    //      sender.sendUserLeftVoiceMessage(props.id, props.recorded, props.voiceConf, nu)
    //      if (user.phoneUser.value) {
    //        if (meeting.hasUser(user.id)) {
    //          val userLeaving = meeting.removeUser(user.id)
    //          userLeaving foreach (u => outGW.send(new UserLeft(props.id, props.recorded, u)))
    //        }
    //      }

    //      stopRecordingVoiceConference()
    //    }
  }

  def handleUserMutedInVoiceConfMessage(msg: UserMutedInVoiceConfMessage) {
    //    meeting.getUserWithVoiceUserId(msg.voiceUserId) foreach { user =>
    //      val talking: Boolean = if (msg.muted) false else user.voiceUser.talking.value
    //      val nv = user.voiceUser.copy(muted = Muted(msg.muted), talking = Talking(talking))
    //      val nu = user.copy(voiceUser = nv)
    //      meeting.saveUser(nu)

    //      log.info("User muted in voice conf. meetingId=" + props.id + " userId=" + nu.id + " user=" + nu)
    //      sender.sendUserVoiceMutedMessage(props.id, props.recorded, props.voiceConf, nu)
    //    }
  }

  def handleUserTalkingInVoiceConfMessage(msg: UserTalkingInVoiceConfMessage) {
    //    meeting.getUserWithVoiceUserId(msg.voiceUserId) foreach { user =>
    //      val nv = user.voiceUser.copy(talking = Talking(msg.talking))
    //      val nu = user.copy(voiceUser = nv)
    //      meeting.saveUser(nu)
    //      println("Received voice talking=[" + msg.talking + "] wid=[" + msg.userId + "]" )
    //      sender.sendUserVoiceTalkingMessage(props.id, props.recorded, props.voiceConf, nu)
    //    }
  }

  def handleAssignPresenter(msg: AssignPresenter): Unit = {
    //    assignNewPresenter(msg.newPresenterId, msg.newPresenterName, msg.assignedBy)
  }

}
