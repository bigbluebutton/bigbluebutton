package org.bigbluebutton.core.running

import java.io.{ PrintWriter, StringWriter }

import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.Props
import akka.actor.OneForOneStrategy
import akka.actor.SupervisorStrategy.Resume
import org.bigbluebutton.core._
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.models.Users

import scala.concurrent.duration._

object MeetingActor {
  def props(mProps: MeetingProperties,
    eventBus: IncomingEventBus,
    outGW: OutMessageGateway, liveMeeting: LiveMeeting): Props =
    Props(classOf[MeetingActor], mProps, eventBus, outGW, liveMeeting)
}

class MeetingActor(val mProps: MeetingProperties,
  val eventBus: IncomingEventBus,
  val outGW: OutMessageGateway, val liveMeeting: LiveMeeting)
    extends Actor with ActorLogging
    with UsersApp with PresentationApp
    with LayoutApp with ChatApp with WhiteboardApp with PollApp
    with BreakoutRoomApp with CaptionApp with SharedNotesApp with PermisssionCheck {

  override val supervisorStrategy = OneForOneStrategy(maxNrOfRetries = 10, withinTimeRange = 1 minute) {
    case e: Exception => {
      val sw: StringWriter = new StringWriter()
      sw.write("An exception has been thrown on MeetingActor, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
      e.printStackTrace(new PrintWriter(sw))
      log.error(sw.toString())
      Resume
    }
  }

  /**
   * Put the internal message injector into another actor so this
   * actor is easy to test.
   */
  var actorMonitor = context.actorOf(MeetingActorInternal.props(mProps, eventBus, outGW), "actorMonitor-" + mProps.meetingID)

  /** Subscribe to meeting and voice events. **/
  eventBus.subscribe(actorMonitor, mProps.meetingID)
  eventBus.subscribe(actorMonitor, mProps.voiceBridge)
  eventBus.subscribe(actorMonitor, mProps.deskshareBridge)

  def receive = {
    case msg: ActivityResponse => handleActivityResponse(msg)
    case msg: MonitorNumberOfUsers => handleMonitorNumberOfUsers(msg)
    case msg: ValidateAuthToken => handleValidateAuthToken(msg)
    case msg: RegisterUser => handleRegisterUser(msg)
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
    case msg: ModifyWhiteboardAccessRequest => handleModifyWhiteboardAccessRequest(msg)
    case msg: GetWhiteboardAccessRequest => handleGetWhiteboardAccessRequest(msg)
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
    case msg: ChangeUserRole => handleChangeUserRole(msg)
    case msg: LogoutEndMeeting => handleLogoutEndMeeting(msg)
    case msg: ClearPublicChatHistoryRequest => handleClearPublicChatHistoryRequest(msg)

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

    // Guest
    case msg: GetGuestPolicy => handleGetGuestPolicy(msg)
    case msg: SetGuestPolicy => handleSetGuestPolicy(msg)
    case msg: RespondToGuest => handleRespondToGuest(msg)

    // Shared Notes
    case msg: PatchDocumentRequest => handlePatchDocumentRequest(msg)
    case msg: GetCurrentDocumentRequest => handleGetCurrentDocumentRequest(msg)
    case msg: CreateAdditionalNotesRequest => handleCreateAdditionalNotesRequest(msg)
    case msg: DestroyAdditionalNotesRequest => handleDestroyAdditionalNotesRequest(msg)
    case msg: RequestAdditionalNotesSetRequest => handleRequestAdditionalNotesSetRequest(msg)
    case msg: SharedNotesSyncNoteRequest => handleSharedNotesSyncNoteRequest(msg)

    case _ => // do nothing
  }

  def handleDeskShareRTMPBroadcastStoppedRequest(msg: DeskShareRTMPBroadcastStoppedRequest): Unit = {
    log.info("handleDeskShareRTMPBroadcastStoppedRequest: isBroadcastingRTMP=" + liveMeeting.meetingModel
      .isBroadcastingRTMP() + " URL:" + liveMeeting.meetingModel.getRTMPBroadcastingUrl())

    // only valid if currently broadcasting
    if (liveMeeting.meetingModel.isBroadcastingRTMP()) {
      log.info("STOP broadcast ALLOWED when isBroadcastingRTMP=true")
      liveMeeting.meetingModel.broadcastingRTMPStopped()

      // notify viewers that RTMP broadcast stopped
      outGW.send(new DeskShareNotifyViewersRTMP(mProps.meetingID, liveMeeting.meetingModel.getRTMPBroadcastingUrl(),
        msg.videoWidth, msg.videoHeight, false))
    } else {
      log.info("STOP broadcast NOT ALLOWED when isBroadcastingRTMP=false")
    }
  }

  def handleDeskShareGetDeskShareInfoRequest(msg: DeskShareGetDeskShareInfoRequest): Unit = {

    log.info("handleDeskShareGetDeskShareInfoRequest: " + msg.conferenceName + "isBroadcasting="
      + liveMeeting.meetingModel.isBroadcastingRTMP() + " URL:" + liveMeeting.meetingModel.getRTMPBroadcastingUrl())
    if (liveMeeting.meetingModel.isBroadcastingRTMP()) {
      // if the meeting has an ongoing WebRTC Deskshare session, send a notification
      outGW.send(new DeskShareNotifyASingleViewer(mProps.meetingID, msg.requesterID, liveMeeting.meetingModel.getRTMPBroadcastingUrl(),
        liveMeeting.meetingModel.getDesktopShareVideoWidth(), liveMeeting.meetingModel.getDesktopShareVideoHeight(), true))
    }
  }

  def handleGetGuestPolicy(msg: GetGuestPolicy) {
    outGW.send(new GetGuestPolicyReply(msg.meetingID, mProps.recorded, msg.requesterID, liveMeeting.meetingModel.getGuestPolicy().toString()))
  }

  def handleSetGuestPolicy(msg: SetGuestPolicy) {
    liveMeeting.meetingModel.setGuestPolicy(msg.policy)
    liveMeeting.meetingModel.setGuestPolicySetBy(msg.setBy)
    outGW.send(new GuestPolicyChanged(msg.meetingID, mProps.recorded, liveMeeting.meetingModel.getGuestPolicy().toString()))
  }

  def handleLogoutEndMeeting(msg: LogoutEndMeeting) {
    if (Users.isModerator(msg.userID, liveMeeting.users)) {
      handleEndMeeting(EndMeeting(mProps.meetingID))
    }
  }

  def handleActivityResponse(msg: ActivityResponse) {
    log.info("User endorsed that meeting {} is active", mProps.meetingID)
    outGW.send(new MeetingIsActive(mProps.meetingID))
  }

  def handleEndMeeting(msg: EndMeeting) {
    // Broadcast users the meeting will end
    outGW.send(new MeetingEnding(msg.meetingId))

    liveMeeting.meetingModel.meetingHasEnded

    outGW.send(new MeetingEnded(msg.meetingId, mProps.recorded, mProps.voiceBridge))
  }

  def handleAllowUserToShareDesktop(msg: AllowUserToShareDesktop): Unit = {
    Users.getCurrentPresenter(liveMeeting.users) match {
      case Some(curPres) => {
        val allowed = msg.userID equals (curPres.id)
        outGW.send(AllowUserToShareDesktopOut(msg.meetingID, msg.userID, allowed))
      }
      case None => // do nothing
    }
  }

  def handleVoiceConfRecordingStartedMessage(msg: VoiceConfRecordingStartedMessage) {
    if (msg.recording) {
      liveMeeting.meetingModel.setVoiceRecordingFilename(msg.recordStream)
      outGW.send(new VoiceRecordingStarted(mProps.meetingID, mProps.recorded, msg.recordStream, msg.timestamp, mProps.voiceBridge))
    } else {
      liveMeeting.meetingModel.setVoiceRecordingFilename("")
      outGW.send(new VoiceRecordingStopped(mProps.meetingID, mProps.recorded, msg.recordStream, msg.timestamp, mProps.voiceBridge))
    }
  }

  def handleSetRecordingStatus(msg: SetRecordingStatus) {
    log.info("Change recording status. meetingId=" + mProps.meetingID + " recording=" + msg.recording)
    if (mProps.allowStartStopRecording && liveMeeting.meetingModel.isRecording() != msg.recording) {
      if (msg.recording) {
        liveMeeting.meetingModel.recordingStarted()
      } else {
        liveMeeting.meetingModel.recordingStopped()
      }

      outGW.send(new RecordingStatusChanged(mProps.meetingID, mProps.recorded, msg.userId, msg.recording))
    }
  }

  // WebRTC Desktop Sharing

  def handleDeskShareStartedRequest(msg: DeskShareStartedRequest): Unit = {
    log.info("handleDeskShareStartedRequest: dsStarted=" + liveMeeting.meetingModel.getDeskShareStarted())

    if (!liveMeeting.meetingModel.getDeskShareStarted()) {
      val timestamp = System.currentTimeMillis().toString
      val streamPath = "rtmp://" + mProps.red5DeskShareIP + "/" + mProps.red5DeskShareApp +
        "/" + mProps.meetingID + "/" + mProps.meetingID + "-" + timestamp
      log.info("handleDeskShareStartedRequest: streamPath=" + streamPath)

      // Tell FreeSwitch to broadcast to RTMP
      outGW.send(new DeskShareStartRTMPBroadcast(msg.conferenceName, streamPath))

      liveMeeting.meetingModel.setDeskShareStarted(true)
    }
  }

  def handleDeskShareStoppedRequest(msg: DeskShareStoppedRequest): Unit = {
    log.info("handleDeskShareStoppedRequest: dsStarted=" + liveMeeting.meetingModel.getDeskShareStarted() +
      " URL:" + liveMeeting.meetingModel.getRTMPBroadcastingUrl())

    // Tell FreeSwitch to stop broadcasting to RTMP
    outGW.send(new DeskShareStopRTMPBroadcast(msg.conferenceName, liveMeeting.meetingModel.getRTMPBroadcastingUrl()))

    liveMeeting.meetingModel.setDeskShareStarted(false)
  }

  def handleDeskShareRTMPBroadcastStartedRequest(msg: DeskShareRTMPBroadcastStartedRequest): Unit = {
    log.info("handleDeskShareRTMPBroadcastStartedRequest: isBroadcastingRTMP=" + liveMeeting.meetingModel.isBroadcastingRTMP() +
      " URL:" + liveMeeting.meetingModel.getRTMPBroadcastingUrl())

    // only valid if not broadcasting yet
    if (!liveMeeting.meetingModel.isBroadcastingRTMP()) {
      liveMeeting.meetingModel.setRTMPBroadcastingUrl(msg.streamname)
      liveMeeting.meetingModel.broadcastingRTMPStarted()
      liveMeeting.meetingModel.setDesktopShareVideoWidth(msg.videoWidth)
      liveMeeting.meetingModel.setDesktopShareVideoHeight(msg.videoHeight)
      log.info("START broadcast ALLOWED when isBroadcastingRTMP=false")

      // Notify viewers in the meeting that there's an rtmp stream to view
      outGW.send(new DeskShareNotifyViewersRTMP(mProps.meetingID, msg.streamname, msg.videoWidth, msg.videoHeight, true))
    } else {
      log.info("START broadcast NOT ALLOWED when isBroadcastingRTMP=true")
    }
  }

  def handleMonitorNumberOfUsers(msg: MonitorNumberOfUsers) {
    monitorNumberOfWebUsers()
    monitorNumberOfUsers()
  }

  def monitorNumberOfWebUsers() {
    if (Users.numWebUsers(liveMeeting.users) == 0 && liveMeeting.meetingModel.lastWebUserLeftOn > 0) {
      if (liveMeeting.timeNowInMinutes - liveMeeting.meetingModel.lastWebUserLeftOn > 2) {
        log.info("Empty meeting. Ejecting all users from voice. meetingId={}", mProps.meetingID)
        outGW.send(new EjectAllVoiceUsers(mProps.meetingID, mProps.recorded, mProps.voiceBridge))
      }
    }
  }

  def monitorNumberOfUsers() {
    val hasUsers = Users.numUsers(liveMeeting.users) != 0
    // TODO: We could use a better control over this message to send it just when it really matters :)
    eventBus.publish(BigBlueButtonEvent(mProps.meetingID, UpdateMeetingExpireMonitor(mProps.meetingID, hasUsers)))
  }

  def handleSendTimeRemainingUpdate(msg: SendTimeRemainingUpdate) {
    if (mProps.duration > 0) {
      val endMeetingTime = liveMeeting.meetingModel.startedOn + (mProps.duration * 60)
      val timeRemaining = endMeetingTime - liveMeeting.timeNowInSeconds
      outGW.send(new MeetingTimeRemainingUpdate(mProps.meetingID, mProps.recorded, timeRemaining.toInt))
    }
    if (!mProps.isBreakout && liveMeeting.breakoutModel.getRooms().length > 0) {
      val room = liveMeeting.breakoutModel.getRooms()(0);
      val endMeetingTime = liveMeeting.meetingModel.breakoutRoomsStartedOn + (liveMeeting.meetingModel.breakoutRoomsdurationInMinutes * 60)
      val timeRemaining = endMeetingTime - liveMeeting.timeNowInSeconds
      outGW.send(new BreakoutRoomsTimeRemainingUpdateOutMessage(mProps.meetingID, mProps.recorded, timeRemaining.toInt))
    } else if (liveMeeting.meetingModel.breakoutRoomsStartedOn != 0) {
      liveMeeting.meetingModel.breakoutRoomsdurationInMinutes = 0;
      liveMeeting.meetingModel.breakoutRoomsStartedOn = 0;
    }
  }

  def handleExtendMeetingDuration(msg: ExtendMeetingDuration) {

  }

  def handleGetRecordingStatus(msg: GetRecordingStatus) {
    outGW.send(new GetRecordingStatusReply(mProps.meetingID, mProps.recorded, msg.userId, liveMeeting.meetingModel.isRecording().booleanValue()))
  }

  def startRecordingIfAutoStart() {
    if (mProps.recorded && !liveMeeting.meetingModel.isRecording() &&
      mProps.autoStartRecording && Users.numWebUsers(liveMeeting.users) == 1) {
      log.info("Auto start recording. meetingId={}", mProps.meetingID)
      liveMeeting.meetingModel.recordingStarted()
      outGW.send(new RecordingStatusChanged(mProps.meetingID, mProps.recorded, "system", liveMeeting.meetingModel.isRecording()))
    }
  }

  def stopAutoStartedRecording() {
    if (mProps.recorded && liveMeeting.meetingModel.isRecording() &&
      mProps.autoStartRecording && Users.numWebUsers(liveMeeting.users) == 0) {
      log.info("Last web user left. Auto stopping recording. meetingId={}", mProps.meetingID)
      liveMeeting.meetingModel.recordingStopped()
      outGW.send(new RecordingStatusChanged(mProps.meetingID, mProps.recorded, "system", liveMeeting.meetingModel.isRecording()))
    }
  }

  def sendMeetingHasEnded(userId: String) {
    outGW.send(new MeetingHasEnded(mProps.meetingID, userId))
    outGW.send(new DisconnectUser(mProps.meetingID, userId))
  }
}
