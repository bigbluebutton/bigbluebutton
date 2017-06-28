package org.bigbluebutton.core.running

import java.io.{ PrintWriter, StringWriter }

import akka.actor._
import akka.actor.ActorLogging
import akka.actor.SupervisorStrategy.Resume
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.core._
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.apps.deskshare.DeskshareApp2x
import org.bigbluebutton.core.apps.presentation.PresentationApp2x
import org.bigbluebutton.core.apps.presentation.poll.PollApp2x
import org.bigbluebutton.core.apps.users.UsersApp2x
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.models.{ RegisteredUsers, Users1x }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.handlers._
import org.bigbluebutton.core2.message.handlers.users._
import org.bigbluebutton.common2.msgs._
import scala.concurrent.duration._
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.core2.message.handlers.breakoutrooms._
import org.bigbluebutton.core2.testdata.FakeTestData
import org.bigbluebutton.core2.message.handlers.layout._

object MeetingActor {
  def props(props: DefaultProps,
    eventBus: IncomingEventBus,
    outGW: OutMessageGateway, liveMeeting: LiveMeeting): Props =
    Props(classOf[MeetingActor], props, eventBus, outGW, liveMeeting)
}

class MeetingActor(val props: DefaultProps,
  val eventBus: IncomingEventBus,
  val outGW: OutMessageGateway, val liveMeeting: LiveMeeting)
    extends Actor with ActorLogging
    with UsersApp with PresentationApp
    with LayoutApp with ChatApp with WhiteboardApp with PollApp
    with BreakoutRoomApp with CaptionApp
    with SharedNotesApp with PermisssionCheck
    with UserBroadcastCamStartMsgHdlr
    with UserJoinedVoiceConfEvtMsgHdlr
    with UserLeftVoiceConfEvtMsgHdlr
    with UserJoinMeetingReqMsgHdlr
    with StartPollReqMsgHdlr
    with UserBroadcastCamStopMsgHdlr
    with UserConnectedToGlobalAudioHdlr
    with UserDisconnectedFromGlobalAudioHdlr
    with MuteAllExceptPresenterRequestHdlr
    with MuteMeetingRequestHdlr
    with IsMeetingMutedRequestHdlr
    with MuteUserRequestHdlr
    with EjectUserFromVoiceRequestHdlr
    with StartCustomPollReqMsgHdlr
    with StopPollReqMsgHdlr
    with RespondToPollReqMsgHdlr
    with GetCurrentPollReqMsgHdlr
    with HidePollResultReqMsgHdlr
    with ShowPollResultReqMsgHdlr
    with UserJoinedVoiceConfMessageHdlr
    with ValidateAuthTokenReqMsgHdlr
    with BreakoutRoomsListMsgHdlr
    with CreateBreakoutRoomsMsgHdlr
    with EndAllBreakoutRoomsMsgHdlr
    with RequestBreakoutJoinURLMsgHdlr
    with BreakoutRoomCreatedMsgHdlr
    with BreakoutRoomEndedMsgHdlr
    with BreakoutRoomUsersUpdateMsgHdlr
    with SendBreakoutUsersUpdateMsgHdlr
    with TransferUserToMeetingRequestHdlr
    with UserMutedInVoiceConfEvtMsgHdlr
    with UserTalkingInVoiceConfEvtMsgHdlr
    with GetCurrentLayoutMsgHdlr
    with LockLayoutMsgHdlr
    with BroadcastLayoutMsgHdlr {

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
  var actorMonitor = context.actorOf(MeetingActorInternal.props(props, eventBus, outGW),
    "actorMonitor-" + props.meetingProp.intId)

  /** Subscribe to meeting and voice events. **/
  eventBus.subscribe(actorMonitor, props.meetingProp.intId)
  eventBus.subscribe(actorMonitor, props.voiceProp.voiceConf)
  eventBus.subscribe(actorMonitor, props.screenshareProps.screenshareConf)

  val usersApp2x = new UsersApp2x(liveMeeting, outGW = outGW)
  val presentationApp2x = new PresentationApp2x(liveMeeting, outGW = outGW)
  val pollApp2x = new PollApp2x(liveMeeting, outGW = outGW)
  val deskshareApp2x = new DeskshareApp2x(liveMeeting, outGW = outGW)

  /*******************************************************************/
  //object FakeTestData extends FakeTestData
  //FakeTestData.createFakeUsers(liveMeeting)
  /*******************************************************************/

  def receive = {
    //=============================
    // 2x messages
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)
    case msg: RegisterUserReqMsg => handleRegisterUserReqMsg(msg)

    //======================================

    //=======================================
    // old messages
    case msg: ActivityResponse => handleActivityResponse(msg)
    case msg: MonitorNumberOfUsers => handleMonitorNumberOfUsers(msg)
    //case msg: RegisterUser => handleRegisterUser(msg)
    case msg: VoiceConfRecordingStartedMessage => handleVoiceConfRecordingStartedMessage(msg)

    case msg: AssignPresenter => handleAssignPresenter(msg)
    case msg: AllowUserToShareDesktop => handleAllowUserToShareDesktop(msg)

    case msg: UserEmojiStatus => handleUserEmojiStatus(msg)

    case msg: MuteMeetingRequest => handleMuteMeetingRequest(msg)
    case msg: MuteAllExceptPresenterRequest => handleMuteAllExceptPresenterRequest(msg)
    case msg: IsMeetingMutedRequest => handleIsMeetingMutedRequest(msg)
    case msg: MuteUserRequest => handleMuteUserRequest(msg)
    case msg: EjectUserFromVoiceRequest => handleEjectUserRequest(msg)
    case msg: TransferUserToMeetingRequest => handleTransferUserToMeeting(msg)
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
    case msg: ResizeAndMoveSlide => handleResizeAndMoveSlide(msg)
    case msg: GotoSlide => handleGotoSlide(msg)
    case msg: SharePresentation => handleSharePresentation(msg)
    case msg: GetSlideInfo => handleGetSlideInfo(msg)
    case msg: PreuploadedPresentations => handlePreuploadedPresentations(msg)
    case msg: SetRecordingStatus => handleSetRecordingStatus(msg)
    case msg: GetRecordingStatus => handleGetRecordingStatus(msg)
    case msg: GetPollRequest => handleGetPollRequest(msg)
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

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      case m: ValidateAuthTokenReqMsg => handleValidateAuthTokenReqMsg(m)
      case m: RegisterUserReqMsg => handleRegisterUserReqMsg(m)
      case m: UserJoinMeetingReqMsg => handle(m)
      case m: UserLeaveReqMsg => handle(m)
      case m: UserBroadcastCamStartMsg => handleUserBroadcastCamStartMsg(m)
      case m: UserBroadcastCamStopMsg => handleUserBroadcastCamStopMsg(m)
      case m: UserJoinedVoiceConfEvtMsg => handleUserJoinedVoiceConfEvtMsg(m)
      case m: SendCursorPositionPubMsg => handleSendCursorPositionPubMsg(m)
      case m: ClearWhiteboardPubMsg => handleClearWhiteboardPubMsg(m)
      case m: UndoWhiteboardPubMsg => handleUndoWhiteboardPubMsg(m)
      case m: ModifyWhiteboardAccessPubMsg => handleModifyWhiteboardAccessPubMsg(m)
      case m: GetWhiteboardAccessReqMsg => handleGetWhiteboardAccessReqMsg(m)
      case m: SendWhiteboardAnnotationPubMsg => handleSendWhiteboardAnnotationPubMsg(m)
      case m: GetWhiteboardAnnotationsReqMsg => handleGetWhiteboardAnnotationsReqMsg(m)
      case m: StartPollReqMsg => handleStartPollReqMsg(m)
      case m: StartCustomPollReqMsg => handleStartCustomPollReqMsg(m)
      case m: StopPollReqMsg => handleStopPollReqMsg(m)
      case m: ShowPollResultReqMsg => handleShowPollResultReqMsg(m)
      case m: HidePollResultReqMsg => handleHidePollResultReqMsg(m)
      case m: GetCurrentPollReqMsg => handleGetCurrentPollReqMsg(m)
      case m: RespondToPollReqMsg => handleRespondToPollReqMsg(m)
      case m: BreakoutRoomsListMsg => handleBreakoutRoomsListMsg(m)
      case m: CreateBreakoutRoomsMsg => handleCreateBreakoutRoomsMsg(m)
      case m: EndAllBreakoutRoomsMsg => handleEndAllBreakoutRoomsMsg(m)
      case m: RequestBreakoutJoinURLMsg => handleRequestBreakoutJoinURLMsg(m)
      case m: BreakoutRoomCreatedMsg => handleBreakoutRoomCreatedMsg(m)
      case m: BreakoutRoomEndedMsg => handleBreakoutRoomEndedMsg(m)
      case m: BreakoutRoomUsersUpdateMsg => handleBreakoutRoomUsersUpdateMsg(m)
      case m: SendBreakoutUsersUpdateMsg => handleSendBreakoutUsersUpdateMsg(m)
      case m: TransferUserToMeetingRequestMsg => handleTransferUserToMeetingRequestMsg(m)
      case m: UserLeftVoiceConfEvtMsg => handle(m)
      case m: UserMutedInVoiceConfEvtMsg => handle(m)
      case m: UserTalkingInVoiceConfEvtMsg => handle(m)
      case m: GetCurrentLayoutMsg => handleGetCurrentLayoutMsg(m)
      case m: LockLayoutMsg => handleLockLayoutMsg(m)
      case m: BroadcastLayoutMsg => handleBroadcastLayoutMsg(m)
      case m: SetCurrentPresentationPubMsg => presentationApp2x.handleSetCurrentPresentationPubMsg(m)
      case m: GetPresentationInfoReqMsg => presentationApp2x.handleGetPresentationInfoReqMsg(m)
      case m: SetCurrentPagePubMsg => presentationApp2x.handleSetCurrentPagePubMsg(m)
      case m: ResizeAndMovePagePubMsg => presentationApp2x.handleResizeAndMovePagePubMsg(m)
      case m: RemovePresentationPubMsg => presentationApp2x.handleRemovePresentationPubMsg(m)
      case m: PreuploadedPresentationsPubMsg => presentationApp2x.handlePreuploadedPresentationsPubMsg(m)
      case m: PresentationConversionUpdatePubMsg => presentationApp2x.handlePresentationConversionUpdatePubMsg(m)
      case m: PresentationPageCountErrorPubMsg => presentationApp2x.handlePresentationPageCountErrorPubMsg(m)
      case m: PresentationPageGeneratedPubMsg => presentationApp2x.handlePresentationPageGeneratedPubMsg(m)
      case m: PresentationConversionCompletedPubMsg => presentationApp2x.handlePresentationConversionCompletedPubMsg(m)
      case _ => log.warning("***** Cannot handle " + msg.envelope.name)
    }
  }

  def handleRegisterUserReqMsg(msg: RegisterUserReqMsg): Unit = {
    log.debug("****** RECEIVED RegisterUserReqMsg msg {}", msg)
    if (MeetingStatus2x.hasMeetingEnded(liveMeeting.status)) {
      // Check first if the meeting has ended and the user refreshed the client to re-connect.
      log.info("Register user failed. Mmeeting has ended. meetingId=" + props.meetingProp.intId +
        " userId=" + msg.body.intUserId)
    } else {
      val regUser = RegisteredUsers.create(msg.body.intUserId, msg.body.extUserId,
        msg.body.name, msg.body.role, msg.body.authToken,
        msg.body.avatarURL, msg.body.guest, msg.body.authed, msg.body.guest, liveMeeting.registeredUsers)

      log.info("Register user success. meetingId=" + props.meetingProp.intId + " userId=" + msg.body.extUserId + " user=" + regUser)
      outGW.send(new UserRegistered(props.meetingProp.intId, props.recordProp.record, regUser))
    }
  }

  def handleDeskShareRTMPBroadcastStoppedRequest(msg: DeskShareRTMPBroadcastStoppedRequest): Unit = {
    log.info("handleDeskShareRTMPBroadcastStoppedRequest: isBroadcastingRTMP=" +
      MeetingStatus2x.isBroadcastingRTMP(liveMeeting.status) + " URL:" +
      MeetingStatus2x.getRTMPBroadcastingUrl(liveMeeting.status))

    // only valid if currently broadcasting
    if (MeetingStatus2x.isBroadcastingRTMP(liveMeeting.status)) {
      log.info("STOP broadcast ALLOWED when isBroadcastingRTMP=true")
      MeetingStatus2x.broadcastingRTMPStopped(liveMeeting.status)

      // notify viewers that RTMP broadcast stopped
      outGW.send(new DeskShareNotifyViewersRTMP(props.meetingProp.intId,
        MeetingStatus2x.getRTMPBroadcastingUrl(liveMeeting.status),
        msg.videoWidth, msg.videoHeight, false))
    } else {
      log.info("STOP broadcast NOT ALLOWED when isBroadcastingRTMP=false")
    }
  }

  def handleDeskShareGetDeskShareInfoRequest(msg: DeskShareGetDeskShareInfoRequest): Unit = {

    log.info("handleDeskShareGetDeskShareInfoRequest: " + msg.conferenceName + "isBroadcasting="
      + MeetingStatus2x.isBroadcastingRTMP(liveMeeting.status) + " URL:" +
      MeetingStatus2x.getRTMPBroadcastingUrl(liveMeeting.status))

    if (MeetingStatus2x.isBroadcastingRTMP(liveMeeting.status)) {
      // if the meeting has an ongoing WebRTC Deskshare session, send a notification
      outGW.send(new DeskShareNotifyASingleViewer(props.meetingProp.intId, msg.requesterID,
        MeetingStatus2x.getRTMPBroadcastingUrl(liveMeeting.status),
        MeetingStatus2x.getDesktopShareVideoWidth(liveMeeting.status),
        MeetingStatus2x.getDesktopShareVideoHeight(liveMeeting.status), true))
    }
  }

  def handleGetGuestPolicy(msg: GetGuestPolicy) {
    //   outGW.send(new GetGuestPolicyReply(msg.meetingID, props.recordProp.record,
    //     msg.requesterID, MeetingStatus2x.getGuestPolicy(liveMeeting.status).toString()))
  }

  def handleSetGuestPolicy(msg: SetGuestPolicy) {
    //    MeetingStatus2x.setGuestPolicy(liveMeeting.status, msg.policy)
    //    MeetingStatus2x.setGuestPolicySetBy(liveMeeting.status, msg.setBy)
    //    outGW.send(new GuestPolicyChanged(msg.meetingID, props.recordProp.record,
    //      MeetingStatus2x.getGuestPolicy(liveMeeting.status).toString()))
  }

  def handleLogoutEndMeeting(msg: LogoutEndMeeting) {
    if (Users1x.isModerator(msg.userID, liveMeeting.users)) {
      handleEndMeeting(EndMeeting(props.meetingProp.intId))
    }
  }

  def handleActivityResponse(msg: ActivityResponse) {
    log.info("User endorsed that meeting {} is active", props.meetingProp.intId)
    outGW.send(new MeetingIsActive(props.meetingProp.intId))
  }

  def handleEndMeeting(msg: EndMeeting) {
    // Broadcast users the meeting will end
    outGW.send(new MeetingEnding(msg.meetingId))

    MeetingStatus2x.meetingHasEnded(liveMeeting.status)

    outGW.send(new MeetingEnded(msg.meetingId, props.recordProp.record, props.meetingProp.intId))
  }

  def handleAllowUserToShareDesktop(msg: AllowUserToShareDesktop): Unit = {
    Users1x.getCurrentPresenter(liveMeeting.users) match {
      case Some(curPres) => {
        val allowed = msg.userID equals (curPres.id)
        outGW.send(AllowUserToShareDesktopOut(msg.meetingID, msg.userID, allowed))
      }
      case None => // do nothing
    }
  }

  def handleVoiceConfRecordingStartedMessage(msg: VoiceConfRecordingStartedMessage) {
    if (msg.recording) {
      MeetingStatus2x.setVoiceRecordingFilename(liveMeeting.status, msg.recordStream)
      outGW.send(new VoiceRecordingStarted(props.meetingProp.intId, props.recordProp.record,
        msg.recordStream, msg.timestamp, props.voiceProp.voiceConf))
    } else {
      MeetingStatus2x.setVoiceRecordingFilename(liveMeeting.status, "")
      outGW.send(new VoiceRecordingStopped(props.meetingProp.intId, props.recordProp.record,
        msg.recordStream, msg.timestamp, props.voiceProp.voiceConf))
    }
  }

  def handleSetRecordingStatus(msg: SetRecordingStatus) {
    log.info("Change recording status. meetingId=" + props.meetingProp.intId + " recording=" + msg.recording)
    if (props.recordProp.allowStartStopRecording &&
      MeetingStatus2x.isRecording(liveMeeting.status) != msg.recording) {
      if (msg.recording) {
        MeetingStatus2x.recordingStarted(liveMeeting.status)
      } else {
        MeetingStatus2x.recordingStopped(liveMeeting.status)
      }

      outGW.send(new RecordingStatusChanged(props.meetingProp.intId, props.recordProp.record, msg.userId, msg.recording))
    }
  }

  // WebRTC Desktop Sharing

  def handleDeskShareStartedRequest(msg: DeskShareStartedRequest): Unit = {
    log.info("handleDeskShareStartedRequest: dsStarted=" + MeetingStatus2x.getDeskShareStarted(liveMeeting.status))

    if (!MeetingStatus2x.getDeskShareStarted(liveMeeting.status)) {
      val timestamp = System.currentTimeMillis().toString
      val streamPath = "rtmp://" + props.screenshareProps.red5ScreenshareIp + "/" + props.screenshareProps.red5ScreenshareApp +
        "/" + props.meetingProp.intId + "/" + props.meetingProp.intId + "-" + timestamp
      log.info("handleDeskShareStartedRequest: streamPath=" + streamPath)

      // Tell FreeSwitch to broadcast to RTMP
      outGW.send(new DeskShareStartRTMPBroadcast(msg.conferenceName, streamPath))

      MeetingStatus2x.setDeskShareStarted(liveMeeting.status, true)
    }
  }

  def handleDeskShareStoppedRequest(msg: DeskShareStoppedRequest): Unit = {
    log.info("handleDeskShareStoppedRequest: dsStarted=" +
      MeetingStatus2x.getDeskShareStarted(liveMeeting.status) +
      " URL:" + MeetingStatus2x.getRTMPBroadcastingUrl(liveMeeting.status))

    // Tell FreeSwitch to stop broadcasting to RTMP
    outGW.send(new DeskShareStopRTMPBroadcast(msg.conferenceName,
      MeetingStatus2x.getRTMPBroadcastingUrl(liveMeeting.status)))

    MeetingStatus2x.setDeskShareStarted(liveMeeting.status, false)
  }

  def handleDeskShareRTMPBroadcastStartedRequest(msg: DeskShareRTMPBroadcastStartedRequest): Unit = {
    log.info("handleDeskShareRTMPBroadcastStartedRequest: isBroadcastingRTMP=" +
      MeetingStatus2x.isBroadcastingRTMP(liveMeeting.status) +
      " URL:" + MeetingStatus2x.getRTMPBroadcastingUrl(liveMeeting.status))

    // only valid if not broadcasting yet
    if (!MeetingStatus2x.isBroadcastingRTMP(liveMeeting.status)) {
      MeetingStatus2x.setRTMPBroadcastingUrl(liveMeeting.status, msg.streamname)
      MeetingStatus2x.broadcastingRTMPStarted(liveMeeting.status)
      MeetingStatus2x.setDesktopShareVideoWidth(liveMeeting.status, msg.videoWidth)
      MeetingStatus2x.setDesktopShareVideoHeight(liveMeeting.status, msg.videoHeight)
      log.info("START broadcast ALLOWED when isBroadcastingRTMP=false")

      // Notify viewers in the meeting that there's an rtmp stream to view
      outGW.send(new DeskShareNotifyViewersRTMP(props.meetingProp.intId, msg.streamname, msg.videoWidth, msg.videoHeight, true))
    } else {
      log.info("START broadcast NOT ALLOWED when isBroadcastingRTMP=true")
    }
  }

  def handleMonitorNumberOfUsers(msg: MonitorNumberOfUsers) {
    monitorNumberOfWebUsers()
    monitorNumberOfUsers()
  }

  def monitorNumberOfWebUsers() {
    if (Users1x.numWebUsers(liveMeeting.users) == 0 &&
      MeetingStatus2x.lastWebUserLeftOn(liveMeeting.status) > 0) {
      if (liveMeeting.timeNowInMinutes - MeetingStatus2x.lastWebUserLeftOn(liveMeeting.status) > 2) {
        log.info("Empty meeting. Ejecting all users from voice. meetingId={}", props.meetingProp.intId)
        outGW.send(new EjectAllVoiceUsers(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf))
      }
    }
  }

  def monitorNumberOfUsers() {
    val hasUsers = Users1x.numUsers(liveMeeting.users) != 0
    // TODO: We could use a better control over this message to send it just when it really matters :)
    eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, UpdateMeetingExpireMonitor(props.meetingProp.intId, hasUsers)))
  }

  def handleSendTimeRemainingUpdate(msg: SendTimeRemainingUpdate) {
    if (props.durationProps.duration > 0) {
      val endMeetingTime = MeetingStatus2x.startedOn(liveMeeting.status) + (props.durationProps.duration * 60)
      val timeRemaining = endMeetingTime - liveMeeting.timeNowInSeconds
      outGW.send(new MeetingTimeRemainingUpdate(props.meetingProp.intId, props.recordProp.record, timeRemaining.toInt))
    }
    if (!props.meetingProp.isBreakout && !BreakoutRooms.getRooms(liveMeeting.breakoutRooms).isEmpty) {
      val endMeetingTime = MeetingStatus2x.breakoutRoomsStartedOn(liveMeeting.status) +
        (MeetingStatus2x.breakoutRoomsdurationInMinutes(liveMeeting.status) * 60)
      val timeRemaining = endMeetingTime - liveMeeting.timeNowInSeconds
      outGW.send(new BreakoutRoomsTimeRemainingUpdateOutMessage(props.meetingProp.intId, props.recordProp.record, timeRemaining.toInt))
    } else if (MeetingStatus2x.breakoutRoomsStartedOn(liveMeeting.status) != 0) {
      MeetingStatus2x.breakoutRoomsdurationInMinutes(liveMeeting.status, 0)
      MeetingStatus2x.breakoutRoomsStartedOn(liveMeeting.status, 0)
    }
  }

  def handleExtendMeetingDuration(msg: ExtendMeetingDuration) {

  }

  def handleGetRecordingStatus(msg: GetRecordingStatus) {
    outGW.send(new GetRecordingStatusReply(props.meetingProp.intId, props.recordProp.record,
      msg.userId, MeetingStatus2x.isRecording(liveMeeting.status).booleanValue()))
  }

  def startRecordingIfAutoStart() {
    if (props.recordProp.record && !MeetingStatus2x.isRecording(liveMeeting.status) &&
      props.recordProp.autoStartRecording && Users1x.numWebUsers(liveMeeting.users) == 1) {
      log.info("Auto start recording. meetingId={}", props.meetingProp.intId)
      MeetingStatus2x.recordingStarted(liveMeeting.status)
      outGW.send(new RecordingStatusChanged(props.meetingProp.intId, props.recordProp.record,
        "system", MeetingStatus2x.isRecording(liveMeeting.status)))
    }
  }

  def stopAutoStartedRecording() {
    if (props.recordProp.record && MeetingStatus2x.isRecording(liveMeeting.status) &&
      props.recordProp.autoStartRecording && Users1x.numWebUsers(liveMeeting.users) == 0) {
      log.info("Last web user left. Auto stopping recording. meetingId={}", props.meetingProp.intId)
      MeetingStatus2x.recordingStopped(liveMeeting.status)
      outGW.send(new RecordingStatusChanged(props.meetingProp.intId, props.recordProp.record,
        "system", MeetingStatus2x.isRecording(liveMeeting.status)))
    }
  }

  def sendMeetingHasEnded(userId: String) {
    outGW.send(new MeetingHasEnded(props.meetingProp.intId, userId))
    outGW.send(new DisconnectUser(props.meetingProp.intId, userId))
  }

  def record(msg: BbbCoreMsg): Unit = {
    if (liveMeeting.props.recordProp.record) {
      outGW.record(msg)
    }
  }
}
