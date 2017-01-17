package org.bigbluebutton.core.running

import java.util.concurrent.TimeUnit

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.running.handlers.{ RegisterUserMsgHdlr, UserJoinMsgHdlr, ValidateAuthTokenMsgHdlr }
import org.bigbluebutton.core.{ MeetingModel, MeetingProperties, OutMessageGateway }

import scala.collection.immutable.ListSet
import scala.collection.mutable.ArrayBuffer
import scala.concurrent.duration._

object MeetingActorInternal {
  def props(mProps: MeetingProperties,
    eventBus: IncomingEventBus,
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
  def props(mProps: MeetingProperties,
    eventBus: IncomingEventBus,
    outGW: OutMessageGateway): Props =
    Props(classOf[MeetingActor], mProps, eventBus, outGW)
}

class MeetingActor(val mProps: MeetingProperties,
  val eventBus: IncomingEventBus,
  val outGW: OutMessageGateway)
    extends Actor with ActorLogging
    with RegisterUserMsgHdlr
    with UserJoinMsgHdlr
    with ValidateAuthTokenMsgHdlr
    with PresentationApp
    with LayoutApp with ChatApp with WhiteboardApp with PollApp
    with BreakoutRoomApp with CaptionApp {

  val chatModel = new ChatModel()
  val layoutModel = new LayoutModel()
  val meetingModel = new MeetingModel()
  val usersModel = new UsersModel()
  val pollModel = new PollModel()
  val wbModel = new WhiteboardModel()
  val presModel = new PresentationModel()
  val breakoutModel = new BreakoutRoomModel()
  val captionModel = new CaptionModel()

  /**
   * Put the internal message injector into another actor so this
   * actor is easy to test.
   */
  var actorMonitor = context.actorOf(MeetingActorInternal.props(mProps, eventBus, outGW))

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

  def hasMeetingEnded(): Boolean = {
    meetingModel.hasMeetingEnded()
  }

  def webUserJoined() {
    if (usersModel.numWebUsers > 0) {
      meetingModel.resetLastWebUserLeftOn()
    }
  }

  def startRecordingIfAutoStart() {
    if (mProps.recorded && !meetingModel.isRecording() && mProps.autoStartRecording && usersModel.numWebUsers == 1) {
      log.info("Auto start recording. meetingId={}", mProps.meetingID)
      meetingModel.recordingStarted()
      outGW.send(new RecordingStatusChanged(mProps.meetingID, mProps.recorded, "system", meetingModel.isRecording()))
    }
  }

  def stopAutoStartedRecording() {
    if (mProps.recorded && meetingModel.isRecording() && mProps.autoStartRecording && usersModel.numWebUsers == 0) {
      log.info("Last web user left. Auto stopping recording. meetingId={}", mProps.meetingID)
      meetingModel.recordingStopped()
      outGW.send(new RecordingStatusChanged(mProps.meetingID, mProps.recorded, "system", meetingModel.isRecording()))
    }
  }

  def startCheckingIfWeNeedToEndVoiceConf() {
    if (usersModel.numWebUsers == 0 && !mProps.isBreakout) {
      meetingModel.lastWebUserLeft()
      log.debug("MonitorNumberOfWebUsers started for meeting [" + mProps.meetingID + "]")
    }
  }

  def sendTimeRemainingNotice() {
    val now = timeNowInSeconds

    if (mProps.duration > 0 && (((meetingModel.startedOn + mProps.duration) - now) < 15)) {
      //  log.warning("MEETING WILL END IN 15 MINUTES!!!!")
    }
  }

  def handleMonitorNumberOfWebUsers(msg: MonitorNumberOfUsers) {
    if (usersModel.numWebUsers == 0 && meetingModel.lastWebUserLeftOn > 0) {
      if (timeNowInMinutes - meetingModel.lastWebUserLeftOn > 2) {
        log.info("Empty meeting. Ejecting all users from voice. meetingId={}", mProps.meetingID)
        outGW.send(new EjectAllVoiceUsers(mProps.meetingID, mProps.recorded, mProps.voiceBridge))
      }
    }
  }

  def handleSendTimeRemainingUpdate(msg: SendTimeRemainingUpdate) {
    if (mProps.duration > 0) {
      val endMeetingTime = meetingModel.startedOn + (mProps.duration * 60)
      val timeRemaining = endMeetingTime - timeNowInSeconds
      outGW.send(new MeetingTimeRemainingUpdate(mProps.meetingID, mProps.recorded, timeRemaining.toInt))
    }
    if (!mProps.isBreakout && breakoutModel.getRooms().length > 0) {
      val room = breakoutModel.getRooms()(0);
      val endMeetingTime = meetingModel.breakoutRoomsStartedOn + (meetingModel.breakoutRoomsdurationInMinutes * 60)
      val timeRemaining = endMeetingTime - timeNowInSeconds
      outGW.send(new BreakoutRoomsTimeRemainingUpdateOutMessage(mProps.meetingID, mProps.recorded, timeRemaining.toInt))
    } else if (meetingModel.breakoutRoomsStartedOn != 0) {
      meetingModel.breakoutRoomsdurationInMinutes = 0;
      meetingModel.breakoutRoomsStartedOn = 0;
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
    outGW.send(new MeetingHasEnded(mProps.meetingID, userId))
    outGW.send(new DisconnectUser(mProps.meetingID, userId))
  }

  def handleEndMeeting(msg: EndMeeting) {
    // Broadcast users the meeting will end
    outGW.send(new MeetingEnding(msg.meetingId))

    meetingModel.meetingHasEnded

    outGW.send(new MeetingEnded(msg.meetingId, mProps.recorded, mProps.voiceBridge))
  }

  def handleAllowUserToShareDesktop(msg: AllowUserToShareDesktop): Unit = {
    usersModel.getCurrentPresenter() match {
      case Some(curPres) => {
        val allowed = msg.userID equals (curPres.userID)
        outGW.send(AllowUserToShareDesktopOut(msg.meetingID, msg.userID, allowed))
      }
      case None => // do nothing
    }
  }

  def handleVoiceConfRecordingStartedMessage(msg: VoiceConfRecordingStartedMessage) {
    if (msg.recording) {
      meetingModel.setVoiceRecordingFilename(msg.recordStream)
      outGW.send(new VoiceRecordingStarted(mProps.meetingID, mProps.recorded, msg.recordStream, msg.timestamp, mProps.voiceBridge))
    } else {
      meetingModel.setVoiceRecordingFilename("")
      outGW.send(new VoiceRecordingStopped(mProps.meetingID, mProps.recorded, msg.recordStream, msg.timestamp, mProps.voiceBridge))
    }
  }

  def handleSetRecordingStatus(msg: SetRecordingStatus) {
    log.info("Change recording status. meetingId=" + mProps.meetingID + " recording=" + msg.recording)
    if (mProps.allowStartStopRecording && meetingModel.isRecording() != msg.recording) {
      if (msg.recording) {
        meetingModel.recordingStarted()
      } else {
        meetingModel.recordingStopped()
      }

      outGW.send(new RecordingStatusChanged(mProps.meetingID, mProps.recorded, msg.userId, msg.recording))
    }
  }

  def handleGetRecordingStatus(msg: GetRecordingStatus) {
    outGW.send(new GetRecordingStatusReply(mProps.meetingID, mProps.recorded, msg.userId, meetingModel.isRecording().booleanValue()))
  }

  def lockLayout(lock: Boolean) {
    meetingModel.lockLayout(lock)
  }

  def newPermissions(np: Permissions) {
    meetingModel.setPermissions(np)
  }

  def permissionsEqual(other: Permissions): Boolean = {
    meetingModel.permissionsEqual(other)
  }

  // WebRTC Desktop Sharing

  def handleDeskShareStartedRequest(msg: DeskShareStartedRequest): Unit = {
    log.info("handleDeskShareStartedRequest: dsStarted=" + meetingModel.getDeskShareStarted())

    if (!meetingModel.getDeskShareStarted()) {
      val timestamp = System.currentTimeMillis().toString
      val streamPath = "rtmp://" + mProps.red5DeskShareIP + "/" + mProps.red5DeskShareApp +
        "/" + mProps.meetingID + "/" + mProps.meetingID + "-" + timestamp
      log.info("handleDeskShareStartedRequest: streamPath=" + streamPath)

      // Tell FreeSwitch to broadcast to RTMP
      outGW.send(new DeskShareStartRTMPBroadcast(msg.conferenceName, streamPath))

      meetingModel.setDeskShareStarted(true)
    }
  }

  def handleDeskShareStoppedRequest(msg: DeskShareStoppedRequest): Unit = {
    log.info("handleDeskShareStoppedRequest: dsStarted=" + meetingModel.getDeskShareStarted() +
      " URL:" + meetingModel.getRTMPBroadcastingUrl())

    // Tell FreeSwitch to stop broadcasting to RTMP
    outGW.send(new DeskShareStopRTMPBroadcast(msg.conferenceName, meetingModel.getRTMPBroadcastingUrl()))

    meetingModel.setDeskShareStarted(false)
  }

  def handleDeskShareRTMPBroadcastStartedRequest(msg: DeskShareRTMPBroadcastStartedRequest): Unit = {
    log.info("handleDeskShareRTMPBroadcastStartedRequest: isBroadcastingRTMP=" + meetingModel.isBroadcastingRTMP() +
      " URL:" + meetingModel.getRTMPBroadcastingUrl())

    // only valid if not broadcasting yet
    if (!meetingModel.isBroadcastingRTMP()) {
      meetingModel.setRTMPBroadcastingUrl(msg.streamname)
      meetingModel.broadcastingRTMPStarted()
      meetingModel.setDesktopShareVideoWidth(msg.videoWidth)
      meetingModel.setDesktopShareVideoHeight(msg.videoHeight)
      log.info("START broadcast ALLOWED when isBroadcastingRTMP=false")

      // Notify viewers in the meeting that there's an rtmp stream to view
      outGW.send(new DeskShareNotifyViewersRTMP(mProps.meetingID, msg.streamname, msg.videoWidth, msg.videoHeight, true))
    } else {
      log.info("START broadcast NOT ALLOWED when isBroadcastingRTMP=true")
    }
  }

  def handleDeskShareRTMPBroadcastStoppedRequest(msg: DeskShareRTMPBroadcastStoppedRequest): Unit = {
    log.info("handleDeskShareRTMPBroadcastStoppedRequest: isBroadcastingRTMP=" + meetingModel
      .isBroadcastingRTMP() + " URL:" + meetingModel.getRTMPBroadcastingUrl())

    // only valid if currently broadcasting
    if (meetingModel.isBroadcastingRTMP()) {
      log.info("STOP broadcast ALLOWED when isBroadcastingRTMP=true")
      meetingModel.broadcastingRTMPStopped()

      // notify viewers that RTMP broadcast stopped
      outGW.send(new DeskShareNotifyViewersRTMP(mProps.meetingID, meetingModel.getRTMPBroadcastingUrl(),
        msg.videoWidth, msg.videoHeight, false))
    } else {
      log.info("STOP broadcast NOT ALLOWED when isBroadcastingRTMP=false")
    }
  }

  def handleDeskShareGetDeskShareInfoRequest(msg: DeskShareGetDeskShareInfoRequest): Unit = {

    log.info("handleDeskShareGetDeskShareInfoRequest: " + msg.conferenceName + "isBroadcasting="
      + meetingModel.isBroadcastingRTMP() + " URL:" + meetingModel.getRTMPBroadcastingUrl())
    if (meetingModel.isBroadcastingRTMP()) {
      // if the meeting has an ongoing WebRTC Deskshare session, send a notification
      outGW.send(new DeskShareNotifyASingleViewer(mProps.meetingID, msg.requesterID, meetingModel.getRTMPBroadcastingUrl(),
        meetingModel.getDesktopShareVideoWidth(), meetingModel.getDesktopShareVideoHeight(), true))
    }
  }
}
