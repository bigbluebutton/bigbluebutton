package org.bigbluebutton.core.running

import java.util.concurrent.TimeUnit

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.models.{ Roles, UserVO, Users, VoiceUser }
import org.bigbluebutton.core.running.handlers.{ RegisterUserMsgHdlr, UserJoinMsgHdlr, ValidateAuthTokenMsgHdlr }
import org.bigbluebutton.core.{ MeetingModel, MeetingProperties, OutMessageGateway }

import scala.collection.immutable.ListSet
import scala.collection.mutable.ArrayBuffer
import scala.concurrent.duration._

object MeetingActorInternal {
  def props(mProps: MeetingProperties, eventBus: IncomingEventBus,
    outGW: OutMessageGateway): Props =
    Props(classOf[MeetingActorInternal], mProps, eventBus, outGW)
}

// This actor is an internal audit actor for each meeting actor that
// periodically sends messages to the meeting actor
class MeetingActorInternal(val mProps: MeetingProperties,
  val eventBus: IncomingEventBus, val outGW: OutMessageGateway)
    extends Actor with ActorLogging {

  import context.dispatcher
  context.system.scheduler.schedule(5 seconds, 10 seconds, self, "MonitorNumberOfWebUsers")

  // Query to get voice conference users
  outGW.send(new GetUsersInVoiceConference(mProps.meetingID, mProps.recorded, mProps.voiceBridge))

  if (mProps.isBreakout) {
    // This is a breakout room. Inform our parent meeting that we have been successfully created.
    eventBus.publish(BigBlueButtonEvent(
      mProps.parentMeetingID,
      BreakoutRoomCreated(mProps.parentMeetingID, mProps.meetingID)))
  }

  def receive = {
    case "MonitorNumberOfWebUsers" => handleMonitorNumberOfWebUsers()
  }

  def handleMonitorNumberOfWebUsers() {
    eventBus.publish(BigBlueButtonEvent(mProps.meetingID, MonitorNumberOfUsers(mProps.meetingID)))

    // Trigger updating users of time remaining on meeting.
    eventBus.publish(BigBlueButtonEvent(mProps.meetingID, SendTimeRemainingUpdate(mProps.meetingID)))

    if (mProps.isBreakout) {
      // This is a breakout room. Update the main meeting with list of users in this breakout room.
      eventBus.publish(BigBlueButtonEvent(mProps.meetingID, SendBreakoutUsersUpdate(mProps.meetingID)))
    }

  }
}

object MeetingActor {
  def props(eventBus: IncomingEventBus,
    outGW: OutMessageGateway, state: MeetingStateModel): Props =
    Props(classOf[MeetingActor], eventBus, outGW, state)
}

class MeetingActor(val eventBus: IncomingEventBus,
  val outGW: OutMessageGateway, val state: MeetingStateModel)
    extends Actor with ActorLogging
    with RegisterUserMsgHdlr
    with UserJoinMsgHdlr
    with ValidateAuthTokenMsgHdlr
    with PresentationApp
    with LayoutApp with ChatApp with WhiteboardApp with PollApp
    with BreakoutRoomApp with CaptionApp {

  /**
   * Put the internal message injector into another actor so this
   * actor is easy to test.
   */
  var actorMonitor = context.actorOf(MeetingActorInternal.props(state.mProps, eventBus, outGW))

  def receive = {
    case msg: MonitorNumberOfUsers => handleMonitorNumberOfWebUsers(msg)
    case msg: ValidateAuthToken => handleValidateAuthToken(msg)
    case msg: RegisterUser => handle(msg)
    case msg: UserJoinedVoiceConfMessage => handleUserJoinedVoiceConfMessage(msg)
    case msg: UserLeftVoiceConfMessage => handleUserLeftVoiceConfMessage(msg)
    case msg: UserMutedInVoiceConfMessage => handleUserMutedInVoiceConfMessage(msg)
    case msg: UserTalkingInVoiceConfMessage => handleUserTalkingInVoiceConfMessage(msg)
    case msg: VoiceConfRecordingStartedMessage => handleVoiceConfRecordingStartedMessage(msg)
    case msg: UserJoining => handleUserJoin(msg)
    case msg: UserLeaving => handleUserLeft(msg)
    case msg: AssignPresenter => handleAssignPresenter(msg)
    case msg: AllowUserToShareDesktop => handleAllowUserToShareDesktop(msg)
    case msg: GetUsers => handleGetUsers(msg)
    case msg: ChangeUserStatus => handleChangeUserStatus(msg)
    case msg: EjectUserFromMeeting => handleEjectUserFromMeeting(msg)
    case msg: UserEmojiStatus => handleUserEmojiStatus(msg)
    case msg: UserShareWebcam => handleUserShareWebcam(msg)
    case msg: UserUnshareWebcam => handleUserunshareWebcam(msg)
    case msg: MuteMeetingRequest => handleMuteMeetingRequest(msg)
    case msg: MuteAllExceptPresenterRequest => handleMuteAllExceptPresenterRequest(msg)
    case msg: IsMeetingMutedRequest => handleIsMeetingMutedRequest(msg)
    case msg: MuteUserRequest => handleMuteUserRequest(msg)
    case msg: EjectUserFromVoiceRequest => handleEjectUserRequest(msg)
    case msg: TransferUserToMeetingRequest => handleTransferUserToMeeting(msg)
    case msg: SetLockSettings => handleSetLockSettings(msg)
    case msg: GetLockSettings => handleGetLockSettings(msg)
    case msg: LockUserRequest => handleLockUserRequest(msg)
    case msg: InitLockSettings => handleInitLockSettings(msg)
    case msg: InitAudioSettings => handleInitAudioSettings(msg)
    case msg: GetChatHistoryRequest => handleGetChatHistoryRequest(msg)
    case msg: SendPublicMessageRequest => handleSendPublicMessageRequest(msg)
    case msg: SendPrivateMessageRequest => handleSendPrivateMessageRequest(msg)
    case msg: UserConnectedToGlobalAudio => handleUserConnectedToGlobalAudio(msg)
    case msg: UserDisconnectedFromGlobalAudio => handleUserDisconnectedFromGlobalAudio(msg)
    case msg: GetCurrentLayoutRequest => handleGetCurrentLayoutRequest(msg)
    case msg: BroadcastLayoutRequest => handleBroadcastLayoutRequest(msg)
    case msg: InitializeMeeting => handleInitializeMeeting(msg)
    case msg: ClearPresentation => handleClearPresentation(msg)
    case msg: PresentationConversionUpdate => handlePresentationConversionUpdate(msg)
    case msg: PresentationPageCountError => handlePresentationPageCountError(msg)
    case msg: PresentationSlideGenerated => handlePresentationSlideGenerated(msg)
    case msg: PresentationConversionCompleted => handlePresentationConversionCompleted(msg)
    case msg: RemovePresentation => handleRemovePresentation(msg)
    case msg: GetPresentationInfo => handleGetPresentationInfo(msg)
    case msg: SendCursorUpdate => handleSendCursorUpdate(msg)
    case msg: ResizeAndMoveSlide => handleResizeAndMoveSlide(msg)
    case msg: GotoSlide => handleGotoSlide(msg)
    case msg: SharePresentation => handleSharePresentation(msg)
    case msg: GetSlideInfo => handleGetSlideInfo(msg)
    case msg: PreuploadedPresentations => handlePreuploadedPresentations(msg)
    case msg: SendWhiteboardAnnotationRequest => handleSendWhiteboardAnnotationRequest(msg)
    case msg: GetWhiteboardShapesRequest => handleGetWhiteboardShapesRequest(msg)
    case msg: ClearWhiteboardRequest => handleClearWhiteboardRequest(msg)
    case msg: UndoWhiteboardRequest => handleUndoWhiteboardRequest(msg)
    case msg: EnableWhiteboardRequest => handleEnableWhiteboardRequest(msg)
    case msg: IsWhiteboardEnabledRequest => handleIsWhiteboardEnabledRequest(msg)
    case msg: SetRecordingStatus => handleSetRecordingStatus(msg)
    case msg: GetRecordingStatus => handleGetRecordingStatus(msg)
    case msg: StartCustomPollRequest => handleStartCustomPollRequest(msg)
    case msg: StartPollRequest => handleStartPollRequest(msg)
    case msg: StopPollRequest => handleStopPollRequest(msg)
    case msg: ShowPollResultRequest => handleShowPollResultRequest(msg)
    case msg: HidePollResultRequest => handleHidePollResultRequest(msg)
    case msg: RespondToPollRequest => handleRespondToPollRequest(msg)
    case msg: GetPollRequest => handleGetPollRequest(msg)
    case msg: GetCurrentPollRequest => handleGetCurrentPollRequest(msg)
    // Breakout rooms
    case msg: BreakoutRoomsListMessage => handleBreakoutRoomsList(msg)
    case msg: CreateBreakoutRooms => handleCreateBreakoutRooms(msg)
    case msg: BreakoutRoomCreated => handleBreakoutRoomCreated(msg)
    case msg: BreakoutRoomEnded => handleBreakoutRoomEnded(msg)
    case msg: RequestBreakoutJoinURLInMessage => handleRequestBreakoutJoinURL(msg)
    case msg: BreakoutRoomUsersUpdate => handleBreakoutRoomUsersUpdate(msg)
    case msg: SendBreakoutUsersUpdate => handleSendBreakoutUsersUpdate(msg)
    case msg: EndAllBreakoutRooms => handleEndAllBreakoutRooms(msg)

    case msg: ExtendMeetingDuration => handleExtendMeetingDuration(msg)
    case msg: SendTimeRemainingUpdate => handleSendTimeRemainingUpdate(msg)
    case msg: EndMeeting => handleEndMeeting(msg)

    // Closed Caption
    case msg: SendCaptionHistoryRequest => handleSendCaptionHistoryRequest(msg)
    case msg: UpdateCaptionOwnerRequest => handleUpdateCaptionOwnerRequest(msg)
    case msg: EditCaptionHistoryRequest => handleEditCaptionHistoryRequest(msg)

    case msg: DeskShareStartedRequest => handleDeskShareStartedRequest(msg)
    case msg: DeskShareStoppedRequest => handleDeskShareStoppedRequest(msg)
    case msg: DeskShareRTMPBroadcastStartedRequest => handleDeskShareRTMPBroadcastStartedRequest(msg)
    case msg: DeskShareRTMPBroadcastStoppedRequest => handleDeskShareRTMPBroadcastStoppedRequest(msg)
    case msg: DeskShareGetDeskShareInfoRequest => handleDeskShareGetDeskShareInfoRequest(msg)

    case _ => // do nothing
  }

  def assignNewPresenter(newPresenterID: String, newPresenterName: String, assignedBy: String) {

    def sendPresenterStateChange(): Unit = {
      outGW.send(new PresenterAssigned(state.mProps.meetingID, state.mProps.recorded, new Presenter(newPresenterID, newPresenterName, assignedBy)))
      outGW.send(new UserStatusChange(state.mProps.meetingID, state.mProps.recorded, newPresenterID, "presenter", true: java.lang.Boolean))
    }

    // Stop poll if one is running as presenter left.
    handleStopPollRequest(StopPollRequest(state.mProps.meetingID, assignedBy))

    if (Users.hasUserWithId(newPresenterID, state.users.toVector)) {

      for {
        curPres <- Users.getCurrentPresenter(state.users.toVector)
        oldPres = Users.unbecomePresenter(curPres)
        _ = state.users.save(oldPres)
      } yield outGW.send(new UserStatusChange(state.mProps.meetingID, state.mProps.recorded, curPres.id, "presenter", false: java.lang.Boolean))

      for {
        u <- Users.findWithId(newPresenterID, state.users.toVector)
        newPres = Users.becomePresenter(u)
        _ = state.users.save(newPres)
      } sendPresenterStateChange()
    }
  }

  def handleUserConnectedToGlobalAudio(msg: UserConnectedToGlobalAudio) {
    log.info("Handling UserConnectedToGlobalAudio: meetingId=" + state.mProps.meetingID + " userId=" + msg.userid)

    for {
      u <- Users.findWithId(msg.userid, state.users.toVector)
      vu = u.voiceUser.copy(joined = false, talking = false)
      uvo = u.copy(listenOnly = true, voiceUser = vu)
      _ = state.users.save(uvo)
    } yield outGW.send(new UserListeningOnly(state.mProps.meetingID, state.mProps.recorded, uvo.id, uvo.listenOnly))
  }

  def handleUserDisconnectedFromGlobalAudio(msg: UserDisconnectedFromGlobalAudio) {
    log.info("Handling UserDisconnectedToGlobalAudio: meetingId=" + state.mProps.meetingID + " userId=" + msg.userid)

    val user = Users.findWithId(msg.userid, state.users.toVector)
    user foreach { u =>
      if (state.meetingStatus.removeGlobalAudioConnection(msg.userid)) {
        if (!u.joinedWeb) {
          val userLeaving = state.users.remove(u.id)
          log.info("Not web user. Send user left message. meetingId=" + state.mProps.meetingID + " userId=" + u.id + " user=" + u)
          userLeaving foreach (u => outGW.send(new UserLeft(state.mProps.meetingID, state.mProps.recorded, u)))
        } else {
          val vu = u.voiceUser.copy(joined = false)
          val uvo = u.copy(listenOnly = false, voiceUser = vu)
          state.users.save(uvo)
          log.info("UserDisconnectedToGlobalAudio: meetingId=" + state.mProps.meetingID + " userId=" + uvo.id + " user=" + uvo)
          outGW.send(new UserListeningOnly(state.mProps.meetingID, state.mProps.recorded, uvo.id, uvo.listenOnly))
        }
      }
    }
  }

  def handleMuteAllExceptPresenterRequest(msg: MuteAllExceptPresenterRequest) {
    if (msg.mute) {
      state.meetingModel.muteMeeting()
    } else {
      state.meetingModel.unmuteMeeting()
    }
    outGW.send(new MeetingMuted(state.mProps.meetingID, state.mProps.recorded, state.meetingModel.isMeetingMuted()))

    Users.usersWhoAreNotPresenter(state.users.toVector) foreach { u =>
      outGW.send(new MuteVoiceUser(state.mProps.meetingID, state.mProps.recorded, msg.requesterID,
        u.id, state.mProps.voiceBridge, u.voiceUser.userId, msg.mute))
    }
  }

  def handleMuteMeetingRequest(msg: MuteMeetingRequest) {
    if (msg.mute) {
      state.meetingModel.muteMeeting()
    } else {
      state.meetingModel.unmuteMeeting()
    }
    outGW.send(new MeetingMuted(state.mProps.meetingID, state.mProps.recorded, state.meetingModel.isMeetingMuted()))

    state.users.toVector foreach { u =>
      outGW.send(new MuteVoiceUser(state.mProps.meetingID, state.mProps.recorded, msg.requesterID,
        u.id, state.mProps.voiceBridge, u.voiceUser.userId, msg.mute))
    }
  }

  def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
    outGW.send(new IsMeetingMutedReply(state.mProps.meetingID, state.mProps.recorded,
      msg.requesterID, state.meetingModel.isMeetingMuted()))
  }

  def handleMuteUserRequest(msg: MuteUserRequest) {
    log.info("Received mute user request. meetingId=" + state.mProps.meetingID + " userId=" + msg.userID + " mute=" + msg.mute)

    for {
      user <- Users.findWithId(msg.userID, state.users.toVector)
    } yield outGW.send(new MuteVoiceUser(state.mProps.meetingID, state.mProps.recorded,
      msg.requesterID, user.id, state.mProps.voiceBridge,
      user.voiceUser.userId, msg.mute))
  }

  def handleEjectUserRequest(msg: EjectUserFromVoiceRequest) {
    log.info("Received eject user request. meetingId=" + msg.meetingID + " userId=" + msg.userId)

    for {
      u <- Users.findWithId(msg.userId, state.users.toVector)
    } yield outGW.send(new EjectVoiceUser(state.mProps.meetingID, state.mProps.recorded, msg.ejectedBy, u.id, state.mProps.voiceBridge, u.voiceUser.userId))
  }

  def handleGetLockSettings(msg: GetLockSettings) {
    //println("*************** Reply with current lock settings ********************")

    //reusing the existing handle for NewPermissionsSettings to reply to the GetLockSettings request
    outGW.send(new NewPermissionsSetting(state.mProps.meetingID, msg.userId,
      state.meetingModel.getPermissions(), state.users.toVector))
  }

  def handleSetLockSettings(msg: SetLockSettings) {
    if (!permissionsEqual(msg.settings)) {
      newPermissions(msg.settings)
      outGW.send(new NewPermissionsSetting(state.mProps.meetingID, msg.setByUser,
        state.meetingModel.getPermissions, state.users.toVector))

      handleLockLayout(msg.settings.lockedLayout, msg.setByUser)
    }
  }

  def handleLockUserRequest(msg: LockUserRequest) {

    for {
      u <- Users.findWithId(msg.userID, state.users.toVector)
      uvo = u.copy(locked = msg.lock)
      _ = state.users.save(uvo)
    } yield outGW.send(new UserLocked(state.mProps.meetingID, u.id, msg.lock))

  }

  def handleInitLockSettings(msg: InitLockSettings) {
    if (!state.meetingModel.permisionsInitialized()) {
      state.meetingModel.initializePermissions()
      newPermissions(msg.settings)
      outGW.send(new PermissionsSettingInitialized(msg.meetingID, msg.settings, state.users.toVector))
    }
  }

  def handleInitAudioSettings(msg: InitAudioSettings) {
    if (!state.meetingModel.audioSettingsInitialized()) {
      state.meetingModel.initializeAudioSettings()

      if (state.meetingModel.isMeetingMuted() != msg.muted) {
        handleMuteAllExceptPresenterRequest(new MuteAllExceptPresenterRequest(state.mProps.meetingID, msg.requesterID, msg.muted));
      }
    }
  }

  def handleUserEmojiStatus(msg: UserEmojiStatus) {

    for {
      user <- Users.findWithId(msg.userId, state.users.toVector)
      uvo = user.copy(emojiStatus = msg.emojiStatus)
      _ = state.users.save(uvo)
    } yield outGW.send(new UserChangedEmojiStatus(state.mProps.meetingID, state.mProps.recorded, msg.emojiStatus, uvo.id))

  }

  def makeSurePresenterIsAssigned(user: UserVO): Unit = {
    if (user.presenter) {
      /* The current presenter has left the meeting. Find a moderator and make
       * him presenter. This way, if there is a moderator in the meeting, there
       * will always be a presenter.
       */
      val moderator = Users.findAModerator(state.users.toVector)
      moderator.foreach { mod =>
        log.info("Presenter left meeting.  meetingId=" + state.mProps.meetingID + " userId=" + user.id
          + ". Making user=[" + mod.id + "] presenter.")
        assignNewPresenter(mod.id, mod.name, mod.id)
      }

      if (state.meetingModel.isBroadcastingRTMP()) {
        // The presenter left during desktop sharing. Stop desktop sharing on FreeSWITCH
        outGW.send(new DeskShareHangUp(state.mProps.meetingID, state.mProps.voiceBridge))

        // notify other clients to close their deskshare view
        outGW.send(new DeskShareNotifyViewersRTMP(state.mProps.meetingID, state.meetingModel.getRTMPBroadcastingUrl(),
          state.meetingModel.getDesktopShareVideoWidth(), state.meetingModel.getDesktopShareVideoHeight(), false))

        // reset meeting info
        state.meetingModel.resetDesktopSharingParams()
      }
    }
  }

  def handleEjectUserFromMeeting(msg: EjectUserFromMeeting) {
    Users.findWithId(msg.userId, state.users.toVector) foreach { user =>
      if (user.voiceUser.joined) {
        outGW.send(new EjectVoiceUser(state.mProps.meetingID, state.mProps.recorded,
          msg.ejectedBy, msg.userId, state.mProps.voiceBridge, user.voiceUser.userId))
      }

      state.users.remove(msg.userId)
      state.registeredUsers.delete(msg.userId)

      makeSurePresenterIsAssigned(user)

      log.info("Ejecting user from meeting.  meetingId=" + state.mProps.meetingID + " userId=" + msg.userId)
      outGW.send(new UserEjectedFromMeeting(state.mProps.meetingID, state.mProps.recorded, msg.userId, msg.ejectedBy))
      outGW.send(new DisconnectUser(state.mProps.meetingID, msg.userId))

      outGW.send(new UserLeft(msg.meetingID, state.mProps.recorded, user))
    }
  }

  def handleUserShareWebcam(msg: UserShareWebcam) {
    Users.findWithId(msg.userId, state.users.toVector) foreach { user =>
      val streams = user.webcamStreams + msg.stream
      val uvo = user.copy(hasStream = true, webcamStreams = streams)
      state.users.save(uvo)
      log.info("User shared webcam.  meetingId=" + state.mProps.meetingID + " userId=" + uvo.id
        + " stream=" + msg.stream + " streams=" + streams)
      outGW.send(new UserSharedWebcam(state.mProps.meetingID, state.mProps.recorded, uvo.id, msg.stream))
    }
  }

  def handleUserunshareWebcam(msg: UserUnshareWebcam) {
    Users.findWithId(msg.userId, state.users.toVector) foreach { user =>
      val streamName = user.webcamStreams find (w => w == msg.stream) foreach { streamName =>
        val streams = user.webcamStreams - streamName
        val uvo = user.copy(hasStream = (!streams.isEmpty), webcamStreams = streams)
        state.users.save(uvo)
        log.info("User unshared webcam.  meetingId=" + state.mProps.meetingID + " userId=" + uvo.id
          + " stream=" + msg.stream + " streams=" + streams)
        outGW.send(new UserUnsharedWebcam(state.mProps.meetingID, state.mProps.recorded, uvo.id, msg.stream))
      }

    }
  }

  def handleChangeUserStatus(msg: ChangeUserStatus): Unit = {
    if (Users.hasUserWithId(msg.userID, state.users.toVector)) {
      outGW.send(new UserStatusChange(state.mProps.meetingID, state.mProps.recorded, msg.userID, msg.status, msg.value))
    }
  }

  def handleGetUsers(msg: GetUsers): Unit = {
    outGW.send(new GetUsersReply(msg.meetingID, msg.requesterID, state.users.toVector))
  }

  def handleUserLeft(msg: UserLeaving): Unit = {

    if (Users.hasUserWithId(msg.userID, state.users.toVector)) {
      val user = state.users.remove(msg.userID)
      user foreach { u =>
        log.info("User left meeting. meetingId=" + state.mProps.meetingID + " userId=" + u.id + " user=" + u)
        outGW.send(new UserLeft(msg.meetingID, state.mProps.recorded, u))

        makeSurePresenterIsAssigned(u)

        val vu = u.voiceUser
        if (vu.joined || u.listenOnly) {
          /**
           * The user that left is still in the voice conference. Maybe this user just got disconnected
           * and is reconnecting. Make the user as joined only in the voice conference. If we get a
           * user left voice conference message, then we will remove the user from the users list.
           */
          switchUserToPhoneUser(new UserJoinedVoiceConfMessage(state.mProps.voiceBridge,
            vu.userId, u.id, u.externalId, vu.callerName,
            vu.callerNum, vu.muted, vu.talking, vu.avatarURL, u.listenOnly));
        }

        checkCaptionOwnerLogOut(u.id)
      }

      startCheckingIfWeNeedToEndVoiceConf()
      stopAutoStartedRecording()
    }
  }

  def getInitialLockStatus(role: String): Boolean = {
    state.meetingModel.getPermissions().lockOnJoin && role != Roles.MODERATOR_ROLE
  }

  def handleUserJoinedVoiceFromPhone(msg: UserJoinedVoiceConfMessage) = {
    log.info("User joining from phone.  meetingId=" + state.mProps.meetingID + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    val user = Users.getUserWithVoiceUserId(msg.voiceUserId, state.users.toVector) match {
      case Some(user) => {
        log.info("Voice user=" + msg.voiceUserId + " is already in conf="
          + state.mProps.voiceBridge + ". Must be duplicate message. meetigId=" + state.mProps.meetingID)
      }
      case None => {
        val webUserId = if (msg.userId != msg.callerIdName) {
          msg.userId
        } else {
          // No current web user. This means that the user called in through
          // the phone. We need to generate a new user as we are not able
          // to match with a web user.
          Users.generateWebUserId(state.users.toVector)
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
          Roles.VIEWER_ROLE, emojiStatus = "none", presenter = false,
          hasStream = false, locked = getInitialLockStatus(Roles.VIEWER_ROLE),
          webcamStreams = new ListSet[String](),
          phoneUser = !msg.listenOnly, vu, listenOnly = msg.listenOnly, avatarURL = msg.avatarURL, joinedWeb = false)

        state.users.save(uvo)

        log.info("User joined from phone.  meetingId=" + state.mProps.meetingID + " userId=" + uvo.id + " user=" + uvo)

        outGW.send(new UserJoined(state.mProps.meetingID, state.mProps.recorded, uvo))
        outGW.send(new UserJoinedVoice(state.mProps.meetingID, state.mProps.recorded, state.mProps.voiceBridge, uvo))

        if (state.meetingModel.isMeetingMuted()) {
          outGW.send(new MuteVoiceUser(state.mProps.meetingID, state.mProps.recorded, uvo.id, uvo.id,
            state.mProps.voiceBridge, vu.userId, state.meetingModel.isMeetingMuted()))
        }
      }
    }
  }

  def startRecordingVoiceConference() {
    if (Users.numUsersInVoiceConference(state.users.toVector) == 1 && state.mProps.recorded && !state.meetingStatus.isVoiceRecording) {
      state.meetingStatus.startRecordingVoice()
      log.info("Send START RECORDING voice conf. meetingId=" + state.mProps.meetingID + " voice conf=" + state.mProps.voiceBridge)
      outGW.send(new StartRecordingVoiceConf(state.mProps.meetingID, state.mProps.recorded, state.mProps.voiceBridge))
    }
  }

  def switchUserToPhoneUser(msg: UserJoinedVoiceConfMessage) = {
    log.info("User has been disconnected but still in voice conf. Switching to phone user. meetingId="
      + state.mProps.meetingID + " callername=" + msg.callerIdName
      + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    Users.findWithId(msg.userId, state.users.toVector) match {
      case Some(user) => {
        val vu = new VoiceUser(msg.voiceUserId, msg.userId, msg.callerIdName,
          msg.callerIdNum, joined = true, locked = false,
          msg.muted, msg.talking, msg.avatarURL, msg.listenOnly)
        val nu = user.copy(voiceUser = vu, listenOnly = msg.listenOnly)
        state.users.save(nu)

        log.info("User joined voice. meetingId=" + state.mProps.meetingID + " userId=" + user.id + " user=" + nu)
        outGW.send(new UserJoinedVoice(state.mProps.meetingID, state.mProps.recorded, state.mProps.voiceBridge, nu))

        if (state.meetingModel.isMeetingMuted()) {
          outGW.send(new MuteVoiceUser(state.mProps.meetingID, state.mProps.recorded,
            nu.id, nu.id, state.mProps.voiceBridge,
            nu.voiceUser.userId, state.meetingModel.isMeetingMuted()))
        }
      }
      case None => {
        handleUserJoinedVoiceFromPhone(msg)
      }
    }
  }

  def handleUserJoinedVoiceConfMessage(msg: UserJoinedVoiceConfMessage) = {
    log.info("Received user joined voice. meetingId=" + state.mProps.meetingID + " callername=" + msg.callerIdName
      + " userId=" + msg.userId + " extUserId=" + msg.externUserId)

    Users.findWithId(msg.userId, state.users.toVector) match {
      case Some(user) => {
        // this is used to restore the mute state on reconnect
        val previouslyMuted = user.voiceUser.muted

        val vu = new VoiceUser(msg.voiceUserId, msg.userId, msg.callerIdName,
          msg.callerIdNum, joined = true, locked = false,
          msg.muted, msg.talking, msg.avatarURL, msg.listenOnly)
        val nu = user.copy(voiceUser = vu, listenOnly = msg.listenOnly)

        state.users.save(nu)

        log.info("User joined voice. meetingId=" + state.mProps.meetingID + " userId=" + user.id + " user=" + nu)
        outGW.send(new UserJoinedVoice(state.mProps.meetingID, state.mProps.recorded, state.mProps.voiceBridge, nu))

        if (state.meetingModel.isMeetingMuted() || previouslyMuted) {
          outGW.send(new MuteVoiceUser(state.mProps.meetingID, state.mProps.recorded,
            nu.id, nu.id, state.mProps.voiceBridge,
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
    if (Users.numUsersInVoiceConference(state.users.toVector) == 0 && state.mProps.recorded && state.meetingStatus.isVoiceRecording) {
      state.meetingStatus.stopRecordingVoice()
      log.info("Send STOP RECORDING voice conf. meetingId=" + state.mProps.meetingID + " voice conf=" + state.mProps.voiceBridge)
      outGW.send(new StopRecordingVoiceConf(state.mProps.meetingID, state.mProps.recorded,
        state.mProps.voiceBridge, state.meetingModel.getVoiceRecordingFilename()))
    }
  }

  def handleUserLeftVoiceConfMessage(msg: UserLeftVoiceConfMessage) {
    log.info("Received user left voice conf. meetingId=" + state.mProps.meetingID + " voice conf=" + msg.voiceConfId
      + " userId=" + msg.voiceUserId)

    Users.getUserWithVoiceUserId(msg.voiceUserId, state.users.toVector) foreach { user =>
      /**
       * Reset user's voice status.
       */
      val vu = new VoiceUser(user.id, user.id, user.name, user.name,
        joined = false, locked = false, muted = false, talking = false, user.avatarURL, listenOnly = false)
      val nu = user.copy(voiceUser = vu, phoneUser = false, listenOnly = false)
      state.users.save(nu)

      log.info("User left voice conf. meetingId=" + state.mProps.meetingID + " userId=" + nu.id + " user=" + nu)
      outGW.send(new UserLeftVoice(state.mProps.meetingID, state.mProps.recorded, state.mProps.voiceBridge, nu))

      if (user.phoneUser) {
        if (Users.hasUserWithId(user.id, state.users.toVector)) {
          val userLeaving = state.users.remove(user.id)
          userLeaving foreach (u => outGW.send(new UserLeft(state.mProps.meetingID, state.mProps.recorded, u)))
        }
      }
    }
    stopRecordingVoiceConference()
  }

  def handleUserMutedInVoiceConfMessage(msg: UserMutedInVoiceConfMessage) {
    Users.getUserWithVoiceUserId(msg.voiceUserId, state.users.toVector) foreach { user =>
      val talking: Boolean = if (msg.muted) false else user.voiceUser.talking
      val nv = user.voiceUser.copy(muted = msg.muted, talking = talking)
      val nu = user.copy(voiceUser = nv)
      state.users.save(nu)

      log.info("User muted in voice conf. meetingId=" + state.mProps.meetingID + " userId=" + nu.id + " user=" + nu)

      outGW.send(new UserVoiceMuted(state.mProps.meetingID, state.mProps.recorded, state.mProps.voiceBridge, nu))
    }
  }

  def handleUserTalkingInVoiceConfMessage(msg: UserTalkingInVoiceConfMessage) {
    Users.getUserWithVoiceUserId(msg.voiceUserId, state.users.toVector) foreach { user =>
      val nv = user.voiceUser.copy(talking = msg.talking)
      val nu = user.copy(voiceUser = nv)
      state.users.save(nu)
      //      println("Received voice talking=[" + msg.talking + "] wid=[" + msg.userId + "]" )
      outGW.send(new UserVoiceTalking(state.mProps.meetingID, state.mProps.recorded, state.mProps.voiceBridge, nu))
    }
  }

  def handleAssignPresenter(msg: AssignPresenter): Unit = {
    assignNewPresenter(msg.newPresenterID, msg.newPresenterName, msg.assignedBy)
  }

  def hasMeetingEnded(): Boolean = {
    state.meetingModel.hasMeetingEnded()
  }

  def webUserJoined() {
    if (Users.numWebUsers(state.users.toVector) > 0) {
      state.meetingModel.resetLastWebUserLeftOn()
    }
  }

  def startRecordingIfAutoStart() {
    if (state.mProps.recorded && !state.meetingModel.isRecording() && state.mProps.autoStartRecording
      && Users.numWebUsers(state.users.toVector) == 1) {
      log.info("Auto start recording. meetingId={}", state.mProps.meetingID)
      state.meetingModel.recordingStarted()
      outGW.send(new RecordingStatusChanged(state.mProps.meetingID, state.mProps.recorded, "system", state.meetingModel.isRecording()))
    }
  }

  def stopAutoStartedRecording() {
    if (state.mProps.recorded && state.meetingModel.isRecording() && state.mProps.autoStartRecording
      && Users.numWebUsers(state.users.toVector) == 0) {
      log.info("Last web user left. Auto stopping recording. meetingId={}", state.mProps.meetingID)
      state.meetingModel.recordingStopped()
      outGW.send(new RecordingStatusChanged(state.mProps.meetingID, state.mProps.recorded, "system", state.meetingModel.isRecording()))
    }
  }

  def startCheckingIfWeNeedToEndVoiceConf() {
    if (Users.numWebUsers(state.users.toVector) == 0 && !state.mProps.isBreakout) {
      state.meetingModel.lastWebUserLeft()
      log.debug("MonitorNumberOfWebUsers started for meeting [" + state.mProps.meetingID + "]")
    }
  }

  def sendTimeRemainingNotice() {
    val now = timeNowInSeconds

    if (state.mProps.duration > 0 && (((state.meetingModel.startedOn + state.mProps.duration) - now) < 15)) {
      //  log.warning("MEETING WILL END IN 15 MINUTES!!!!")
    }
  }

  def handleMonitorNumberOfWebUsers(msg: MonitorNumberOfUsers) {
    if (Users.numWebUsers(state.users.toVector) == 0 && state.meetingModel.lastWebUserLeftOn > 0) {
      if (timeNowInMinutes - state.meetingModel.lastWebUserLeftOn > 2) {
        log.info("Empty meeting. Ejecting all users from voice. meetingId={}", state.mProps.meetingID)
        outGW.send(new EjectAllVoiceUsers(state.mProps.meetingID, state.mProps.recorded, state.mProps.voiceBridge))
      }
    }
  }

  def handleSendTimeRemainingUpdate(msg: SendTimeRemainingUpdate) {
    if (state.mProps.duration > 0) {
      val endMeetingTime = state.meetingModel.startedOn + (state.mProps.duration * 60)
      val timeRemaining = endMeetingTime - timeNowInSeconds
      outGW.send(new MeetingTimeRemainingUpdate(state.mProps.meetingID, state.mProps.recorded, timeRemaining.toInt))
    }
    if (!state.mProps.isBreakout && state.breakoutModel.getRooms().length > 0) {
      val room = state.breakoutModel.getRooms()(0);
      val endMeetingTime = state.meetingModel.breakoutRoomsStartedOn + (state.meetingModel.breakoutRoomsdurationInMinutes * 60)
      val timeRemaining = endMeetingTime - timeNowInSeconds
      outGW.send(new BreakoutRoomsTimeRemainingUpdateOutMessage(state.mProps.meetingID, state.mProps.recorded, timeRemaining.toInt))
    } else if (state.meetingModel.breakoutRoomsStartedOn != 0) {
      state.meetingModel.breakoutRoomsdurationInMinutes = 0;
      state.meetingModel.breakoutRoomsStartedOn = 0;
    }
  }

  def handleExtendMeetingDuration(msg: ExtendMeetingDuration) {

  }

  def timeNowInMinutes(): Long = {
    TimeUnit.NANOSECONDS.toMinutes(System.nanoTime())
  }

  def timeNowInSeconds(): Long = {
    TimeUnit.NANOSECONDS.toSeconds(System.nanoTime())
  }

  def sendMeetingHasEnded(userId: String) {
    outGW.send(new MeetingHasEnded(state.mProps.meetingID, userId))
    outGW.send(new DisconnectUser(state.mProps.meetingID, userId))
  }

  def handleEndMeeting(msg: EndMeeting) {
    // Broadcast users the meeting will end
    outGW.send(new MeetingEnding(msg.meetingId))

    state.meetingModel.meetingHasEnded

    outGW.send(new MeetingEnded(msg.meetingId, state.mProps.recorded, state.mProps.voiceBridge))
  }

  def handleAllowUserToShareDesktop(msg: AllowUserToShareDesktop): Unit = {
    Users.getCurrentPresenter(state.users.toVector) match {
      case Some(curPres) => {
        val allowed = msg.userID equals (curPres.id)
        outGW.send(AllowUserToShareDesktopOut(msg.meetingID, msg.userID, allowed))
      }
      case None => // do nothing
    }
  }

  def handleVoiceConfRecordingStartedMessage(msg: VoiceConfRecordingStartedMessage) {
    if (msg.recording) {
      state.meetingModel.setVoiceRecordingFilename(msg.recordStream)
      outGW.send(new VoiceRecordingStarted(state.mProps.meetingID, state.mProps.recorded, msg.recordStream, msg.timestamp, state.mProps.voiceBridge))
    } else {
      state.meetingModel.setVoiceRecordingFilename("")
      outGW.send(new VoiceRecordingStopped(state.mProps.meetingID, state.mProps.recorded, msg.recordStream, msg.timestamp, state.mProps.voiceBridge))
    }
  }

  def handleSetRecordingStatus(msg: SetRecordingStatus) {
    log.info("Change recording status. meetingId=" + state.mProps.meetingID + " recording=" + msg.recording)
    if (state.mProps.allowStartStopRecording && state.meetingModel.isRecording() != msg.recording) {
      if (msg.recording) {
        state.meetingModel.recordingStarted()
      } else {
        state.meetingModel.recordingStopped()
      }

      outGW.send(new RecordingStatusChanged(state.mProps.meetingID, state.mProps.recorded, msg.userId, msg.recording))
    }
  }

  def handleGetRecordingStatus(msg: GetRecordingStatus) {
    outGW.send(new GetRecordingStatusReply(state.mProps.meetingID, state.mProps.recorded, msg.userId, state.meetingModel.isRecording().booleanValue()))
  }

  def lockLayout(lock: Boolean) {
    state.meetingModel.lockLayout(lock)
  }

  def newPermissions(np: Permissions) {
    state.meetingModel.setPermissions(np)
  }

  def permissionsEqual(other: Permissions): Boolean = {
    state.meetingModel.permissionsEqual(other)
  }

  // WebRTC Desktop Sharing

  def handleDeskShareStartedRequest(msg: DeskShareStartedRequest): Unit = {
    log.info("handleDeskShareStartedRequest: dsStarted=" + state.meetingModel.getDeskShareStarted())

    if (!state.meetingModel.getDeskShareStarted()) {
      val timestamp = System.currentTimeMillis().toString
      val streamPath = "rtmp://" + state.mProps.red5DeskShareIP + "/" + state.mProps.red5DeskShareApp +
        "/" + state.mProps.meetingID + "/" + state.mProps.meetingID + "-" + timestamp
      log.info("handleDeskShareStartedRequest: streamPath=" + streamPath)

      // Tell FreeSwitch to broadcast to RTMP
      outGW.send(new DeskShareStartRTMPBroadcast(msg.conferenceName, streamPath))

      state.meetingModel.setDeskShareStarted(true)
    }
  }

  def handleDeskShareStoppedRequest(msg: DeskShareStoppedRequest): Unit = {
    log.info("handleDeskShareStoppedRequest: dsStarted=" + state.meetingModel.getDeskShareStarted() +
      " URL:" + state.meetingModel.getRTMPBroadcastingUrl())

    // Tell FreeSwitch to stop broadcasting to RTMP
    outGW.send(new DeskShareStopRTMPBroadcast(msg.conferenceName, state.meetingModel.getRTMPBroadcastingUrl()))

    state.meetingModel.setDeskShareStarted(false)
  }

  def handleDeskShareRTMPBroadcastStartedRequest(msg: DeskShareRTMPBroadcastStartedRequest): Unit = {
    log.info("handleDeskShareRTMPBroadcastStartedRequest: isBroadcastingRTMP=" + state.meetingModel.isBroadcastingRTMP() +
      " URL:" + state.meetingModel.getRTMPBroadcastingUrl())

    // only valid if not broadcasting yet
    if (!state.meetingModel.isBroadcastingRTMP()) {
      state.meetingModel.setRTMPBroadcastingUrl(msg.streamname)
      state.meetingModel.broadcastingRTMPStarted()
      state.meetingModel.setDesktopShareVideoWidth(msg.videoWidth)
      state.meetingModel.setDesktopShareVideoHeight(msg.videoHeight)
      log.info("START broadcast ALLOWED when isBroadcastingRTMP=false")

      // Notify viewers in the meeting that there's an rtmp stream to view
      outGW.send(new DeskShareNotifyViewersRTMP(state.mProps.meetingID, msg.streamname, msg.videoWidth, msg.videoHeight, true))
    } else {
      log.info("START broadcast NOT ALLOWED when isBroadcastingRTMP=true")
    }
  }

  def handleDeskShareRTMPBroadcastStoppedRequest(msg: DeskShareRTMPBroadcastStoppedRequest): Unit = {
    log.info("handleDeskShareRTMPBroadcastStoppedRequest: isBroadcastingRTMP=" + state.meetingModel
      .isBroadcastingRTMP() + " URL:" + state.meetingModel.getRTMPBroadcastingUrl())

    // only valid if currently broadcasting
    if (state.meetingModel.isBroadcastingRTMP()) {
      log.info("STOP broadcast ALLOWED when isBroadcastingRTMP=true")
      state.meetingModel.broadcastingRTMPStopped()

      // notify viewers that RTMP broadcast stopped
      outGW.send(new DeskShareNotifyViewersRTMP(state.mProps.meetingID, state.meetingModel.getRTMPBroadcastingUrl(),
        msg.videoWidth, msg.videoHeight, false))
    } else {
      log.info("STOP broadcast NOT ALLOWED when isBroadcastingRTMP=false")
    }
  }

  def handleDeskShareGetDeskShareInfoRequest(msg: DeskShareGetDeskShareInfoRequest): Unit = {

    log.info("handleDeskShareGetDeskShareInfoRequest: " + msg.conferenceName + "isBroadcasting="
      + state.meetingModel.isBroadcastingRTMP() + " URL:" + state.meetingModel.getRTMPBroadcastingUrl())
    if (state.meetingModel.isBroadcastingRTMP()) {
      // if the meeting has an ongoing WebRTC Deskshare session, send a notification
      outGW.send(new DeskShareNotifyASingleViewer(state.mProps.meetingID, msg.requesterID, state.meetingModel.getRTMPBroadcastingUrl(),
        state.meetingModel.getDesktopShareVideoWidth(), state.meetingModel.getDesktopShareVideoHeight(), true))
    }
  }
}
