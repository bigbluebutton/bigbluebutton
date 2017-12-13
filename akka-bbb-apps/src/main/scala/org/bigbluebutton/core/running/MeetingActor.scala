package org.bigbluebutton.core.running

import java.io.{ PrintWriter, StringWriter }

import akka.actor._
import akka.actor.SupervisorStrategy.Resume
import org.bigbluebutton.core.apps.groupchats.{ GroupChatApp, GroupChatHdlrs }
import org.bigbluebutton.core.apps.presentationpod._
import org.bigbluebutton.core.apps.users._
import org.bigbluebutton.core.apps.whiteboard.ClientToServerLatencyTracerMsgHdlr
import org.bigbluebutton.core.domain.{ MeetingExpiryTracker, MeetingInactivityTracker, MeetingState2x }
import org.bigbluebutton.core.util.TimeUtil
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.apps.caption.CaptionApp2x
import org.bigbluebutton.core.apps.chat.ChatApp2x
import org.bigbluebutton.core.apps.screenshare.ScreenshareApp2x
import org.bigbluebutton.core.apps.presentation.PresentationApp2x
import org.bigbluebutton.core.apps.users.UsersApp2x
import org.bigbluebutton.core.apps.sharednotes.SharedNotesApp2x
import org.bigbluebutton.core.apps.whiteboard.WhiteboardApp2x
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.handlers._
import org.bigbluebutton.core2.message.handlers.meeting._
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.breakout._
import org.bigbluebutton.core.apps.polls._
import org.bigbluebutton.core.apps.voice._

import scala.concurrent.duration._
import org.bigbluebutton.core.apps.layout.LayoutApp2x
import org.bigbluebutton.core.apps.meeting.{ SyncGetMeetingInfoRespMsgHdlr, ValidateConnAuthTokenSysMsgHdlr }
import org.bigbluebutton.core.apps.users.ChangeLockSettingsInMeetingCmdMsgHdlr
import org.bigbluebutton.core2.message.senders.MsgBuilder

object MeetingActor {
  def props(
    props:       DefaultProps,
    eventBus:    InternalEventBus,
    outGW:       OutMsgRouter,
    liveMeeting: LiveMeeting
  ): Props =
    Props(classOf[MeetingActor], props, eventBus, outGW, liveMeeting)
}

class MeetingActor(
  val props:       DefaultProps,
  val eventBus:    InternalEventBus,
  val outGW:       OutMsgRouter,
  val liveMeeting: LiveMeeting
)
    extends BaseMeetingActor
    with GuestsApp
    with LayoutApp2x
    with VoiceApp2x
    with BreakoutApp2x
    with UsersApp2x

    with UserBroadcastCamStartMsgHdlr
    with UserJoinMeetingReqMsgHdlr
    with UserJoinMeetingAfterReconnectReqMsgHdlr
    with UserBroadcastCamStopMsgHdlr
    with UserConnectedToGlobalAudioMsgHdlr
    with UserDisconnectedFromGlobalAudioMsgHdlr
    with MuteAllExceptPresentersCmdMsgHdlr
    with MuteMeetingCmdMsgHdlr
    with IsMeetingMutedReqMsgHdlr

    with EjectUserFromVoiceCmdMsgHdlr
    with EndMeetingSysCmdMsgHdlr
    with DestroyMeetingSysCmdMsgHdlr
    with SendTimeRemainingUpdateHdlr
    with SendBreakoutTimeRemainingMsgHdlr
    with ChangeLockSettingsInMeetingCmdMsgHdlr
    with SyncGetMeetingInfoRespMsgHdlr
    with ClientToServerLatencyTracerMsgHdlr
    with ValidateConnAuthTokenSysMsgHdlr {

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
  var actorMonitor = context.actorOf(
    MeetingActorAudit.props(props, eventBus, outGW),
    "actorMonitor-" + props.meetingProp.intId
  )

  val msgBus = MessageBus(eventBus, outGW)

  val presentationApp2x = new PresentationApp2x
  val screenshareApp2x = new ScreenshareApp2x
  val captionApp2x = new CaptionApp2x
  val sharedNotesApp2x = new SharedNotesApp2x
  val chatApp2x = new ChatApp2x
  val usersApp = new UsersApp(liveMeeting, outGW, eventBus)
  val groupChatApp = new GroupChatHdlrs
  val presentationPodsApp = new PresentationPodHdlrs
  val pollApp = new PollApp2x
  val wbApp = new WhiteboardApp2x

  object ExpiryTrackerHelper extends MeetingExpiryTrackerHelper

  val inactivityTracker = new MeetingInactivityTracker(
    TimeUtil.minutesToMillis(props.durationProps.maxInactivityTimeoutMinutes),
    TimeUtil.minutesToMillis(props.durationProps.warnMinutesBeforeMax),
    lastActivityTimestampInMs = TimeUtil.timeNowInMs(),
    warningSent = false,
    warningSentOnTimestampInMs = 0L
  )

  val expiryTracker = new MeetingExpiryTracker(
    startedOnInMs = TimeUtil.timeNowInMs(),
    userHasJoined = false,
    lastUserLeftOnInMs = None,
    durationInMs = TimeUtil.minutesToMillis(props.durationProps.duration),
    meetingExpireIfNoUserJoinedInMs = TimeUtil.minutesToMillis(props.durationProps.meetingExpireIfNoUserJoinedInMinutes),
    meetingExpireWhenLastUserLeftInMs = TimeUtil.minutesToMillis(props.durationProps.meetingExpireWhenLastUserLeftInMinutes)
  )

  var state = new MeetingState2x(
    new GroupChats(Map.empty),
    new PresentationPodManager(Map.empty),
    None,
    inactivityTracker,
    expiryTracker
  )

  var lastRttTestSentOn = System.currentTimeMillis()

  // Create a default publish group chat
  state = GroupChatApp.createDefaultPublicGroupChat(GroupChatApp.MAIN_PUBLIC_CHAT, state)
  //state = GroupChatApp.genTestChatMsgHistory(GroupChatApp.MAIN_PUBLIC_CHAT, state, BbbSystemConst.SYSTEM_USER, liveMeeting)

  // Create a default publish group chat
  //state = GroupChatApp.createDefaultPublicGroupChat("TEST_GROUP_CHAT", state)
  //state = GroupChatApp.genTestChatMsgHistory("TEST_GROUP_CHAT", state, BbbSystemConst.SYSTEM_USER, liveMeeting)

  log.debug("NUM GROUP CHATS = " + state.groupChats.findAllPublicChats().length)

  // Create a default Presentation Pod
  state = PresentationPodsApp.createDefaultPresentationPod(state)
  log.debug("NUM Presentation Pods = " + state.presentationPodManager.getNumberOfPods())

  /*******************************************************************/
  //object FakeTestData extends FakeTestData
  //FakeTestData.createFakeUsers(liveMeeting)
  /*******************************************************************/

  def receive = {
    //=============================
    // 2x messages
    case msg: BbbCommonEnvCoreMsg             => handleBbbCommonEnvCoreMsg(msg)

    // Handling RegisterUserReqMsg as it is forwarded from BBBActor and
    // its type is not BbbCommonEnvCoreMsg
    case m: RegisterUserReqMsg                => usersApp.handleRegisterUserReqMsg(m)

    case m: EjectDuplicateUserReqMsg          => usersApp.handleEjectDuplicateUserReqMsg(m)
    case m: GetAllMeetingsReqMsg              => handleGetAllMeetingsReqMsg(m)

    // Meeting
    case m: DestroyMeetingSysCmdMsg           => handleDestroyMeetingSysCmdMsg(m)

    //======================================

    //=======================================
    // internal messages
    case msg: MonitorNumberOfUsersInternalMsg => handleMonitorNumberOfUsers(msg)

    case msg: ExtendMeetingDuration           => handleExtendMeetingDuration(msg)
    case msg: SendTimeRemainingAuditInternalMsg =>
      state = handleSendTimeRemainingUpdate(msg, state)
      state = handleSendBreakoutTimeRemainingMsg(msg, state)
    case msg: BreakoutRoomCreatedInternalMsg     => state = handleBreakoutRoomCreatedInternalMsg(msg, state)
    case msg: SendBreakoutUsersAuditInternalMsg  => handleSendBreakoutUsersUpdateInternalMsg(msg)
    case msg: BreakoutRoomUsersUpdateInternalMsg => state = handleBreakoutRoomUsersUpdateInternalMsg(msg, state)
    case msg: EndBreakoutRoomInternalMsg         => handleEndBreakoutRoomInternalMsg(msg)
    case msg: BreakoutRoomEndedInternalMsg       => state = handleBreakoutRoomEndedInternalMsg(msg, state)

    // Screenshare
    case msg: DeskShareGetDeskShareInfoRequest   => handleDeskShareGetDeskShareInfoRequest(msg)

    case _                                       => // do nothing
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    val tracker = state.inactivityTracker.updateLastActivityTimestamp(TimeUtil.timeNowInMs())
    state = state.update(tracker)

    msg.core match {
      case m: EndMeetingSysCmdMsg => handleEndMeeting(m, state)

      // Users
      case m: ValidateAuthTokenReqMsg => state = usersApp.handleValidateAuthTokenReqMsg(m, state)
      case m: UserJoinMeetingReqMsg => state = handleUserJoinMeetingReqMsg(m, state)
      case m: UserJoinMeetingAfterReconnectReqMsg => state = handleUserJoinMeetingAfterReconnectReqMsg(m, state)
      case m: UserLeaveReqMsg => state = handleUserLeaveReqMsg(m, state)
      case m: UserBroadcastCamStartMsg => handleUserBroadcastCamStartMsg(m)
      case m: UserBroadcastCamStopMsg => handleUserBroadcastCamStopMsg(m)
      case m: UserJoinedVoiceConfEvtMsg => handleUserJoinedVoiceConfEvtMsg(m)
      case m: MeetingActivityResponseCmdMsg => state = usersApp.handleMeetingActivityResponseCmdMsg(m, state)
      case m: LogoutAndEndMeetingCmdMsg => usersApp.handleLogoutAndEndMeetingCmdMsg(m, state)
      case m: SetRecordingStatusCmdMsg => usersApp.handleSetRecordingStatusCmdMsg(m)
      case m: GetRecordingStatusReqMsg => usersApp.handleGetRecordingStatusReqMsg(m)
      case m: ChangeUserEmojiCmdMsg => handleChangeUserEmojiCmdMsg(m)
      case m: EjectUserFromMeetingCmdMsg => usersApp.handleEjectUserFromMeetingCmdMsg(m)
      case m: GetUsersMeetingReqMsg => usersApp.handleGetUsersMeetingReqMsg(m)
      case m: ChangeUserRoleCmdMsg => usersApp.handleChangeUserRoleCmdMsg(m)
      case m: AddUserToPresenterGroupCmdMsg => usersApp.handleAddUserToPresenterGroupCmdMsg(m)
      case m: RemoveUserFromPresenterGroupCmdMsg => state = usersApp.handleRemoveUserFromPresenterGroupCmdMsg(m, state)
      case m: GetPresenterGroupReqMsg => usersApp.handleGetPresenterGroupReqMsg(m)

      // Whiteboard
      case m: SendCursorPositionPubMsg => wbApp.handle(m, liveMeeting, msgBus)
      case m: ClearWhiteboardPubMsg => wbApp.handle(m, liveMeeting, msgBus)
      case m: UndoWhiteboardPubMsg => wbApp.handle(m, liveMeeting, msgBus)
      case m: ModifyWhiteboardAccessPubMsg => wbApp.handle(m, liveMeeting, msgBus)
      case m: SendWhiteboardAnnotationPubMsg => wbApp.handle(m, liveMeeting, msgBus)
      case m: GetWhiteboardAnnotationsReqMsg => wbApp.handle(m, liveMeeting, msgBus)

      case m: ClientToServerLatencyTracerMsg => handleClientToServerLatencyTracerMsg(m)

      // Poll
      case m: StartPollReqMsg => pollApp.handle(m, state, liveMeeting, msgBus) // passing state but not modifying it
      case m: StartCustomPollReqMsg => pollApp.handle(m, state, liveMeeting, msgBus) // passing state but not modifying it
      case m: StopPollReqMsg => pollApp.handle(m, state, liveMeeting, msgBus) // passing state but not modifying it
      case m: ShowPollResultReqMsg => pollApp.handle(m, state, liveMeeting, msgBus) // passing state but not modifying it
      case m: GetCurrentPollReqMsg => pollApp.handle(m, state, liveMeeting, msgBus) // passing state but not modifying it
      case m: RespondToPollReqMsg => pollApp.handle(m, liveMeeting, msgBus)

      // Breakout
      case m: BreakoutRoomsListMsg => state = handleBreakoutRoomsListMsg(m, state)
      case m: CreateBreakoutRoomsCmdMsg => state = handleCreateBreakoutRoomsCmdMsg(m, state)
      case m: EndAllBreakoutRoomsMsg => state = handleEndAllBreakoutRoomsMsg(m, state)
      case m: RequestBreakoutJoinURLReqMsg => state = handleRequestBreakoutJoinURLReqMsg(m, state)
      case m: TransferUserToMeetingRequestMsg => state = handleTransferUserToMeetingRequestMsg(m, state)

      // Voice
      case m: UserLeftVoiceConfEvtMsg => handleUserLeftVoiceConfEvtMsg(m)
      case m: UserMutedInVoiceConfEvtMsg => handleUserMutedInVoiceConfEvtMsg(m)
      case m: UserTalkingInVoiceConfEvtMsg => handleUserTalkingInVoiceConfEvtMsg(m)
      case m: RecordingStartedVoiceConfEvtMsg => handleRecordingStartedVoiceConfEvtMsg(m)
      case m: MuteUserCmdMsg => usersApp.handleMuteUserCmdMsg(m)
      case m: MuteAllExceptPresentersCmdMsg => handleMuteAllExceptPresentersCmdMsg(m)
      case m: EjectUserFromVoiceCmdMsg => handleEjectUserFromVoiceCmdMsg(m)
      case m: IsMeetingMutedReqMsg => handleIsMeetingMutedReqMsg(m)
      case m: MuteMeetingCmdMsg => handleMuteMeetingCmdMsg(m)
      case m: UserConnectedToGlobalAudioMsg => handleUserConnectedToGlobalAudioMsg(m)
      case m: UserDisconnectedFromGlobalAudioMsg => handleUserDisconnectedFromGlobalAudioMsg(m)
      case m: VoiceConfRunningEvtMsg => handleVoiceConfRunningEvtMsg(m)

      // Layout
      case m: GetCurrentLayoutReqMsg => handleGetCurrentLayoutReqMsg(m)
      case m: BroadcastLayoutMsg => handleBroadcastLayoutMsg(m)

      // Lock Settings
      case m: ChangeLockSettingsInMeetingCmdMsg => handleSetLockSettings(m)
      case m: LockUserInMeetingCmdMsg => handleLockUserInMeetingCmdMsg(m)
      case m: LockUsersInMeetingCmdMsg => handleLockUsersInMeetingCmdMsg(m)
      case m: GetLockSettingsReqMsg => handleGetLockSettingsReqMsg(m)

      // Presentation
      case m: PreuploadedPresentationsSysPubMsg => presentationApp2x.handle(m, liveMeeting, msgBus)
      case m: AssignPresenterReqMsg => handlePresenterChange(m)

      // Presentation Pods
      case m: CreateNewPresentationPodPubMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: RemovePresentationPodPubMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: GetPresentationInfoReqMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: GetAllPresentationPodsReqMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: SetCurrentPresentationPubMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationConversionCompletedSysPubMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: SetCurrentPagePubMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: SetPresenterInPodReqMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: RemovePresentationPubMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationConversionUpdateSysPubMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationPageGeneratedSysPubMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationPageCountErrorSysPubMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationUploadTokenReqMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: ResizeAndMovePagePubMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)

      // Caption
      case m: EditCaptionHistoryPubMsg => captionApp2x.handle(m, liveMeeting, msgBus)
      case m: UpdateCaptionOwnerPubMsg => captionApp2x.handle(m, liveMeeting, msgBus)
      case m: SendCaptionHistoryReqMsg => captionApp2x.handle(m, liveMeeting, msgBus)

      // SharedNotes
      case m: GetSharedNotesPubMsg => sharedNotesApp2x.handle(m, liveMeeting, msgBus)
      case m: SyncSharedNotePubMsg => sharedNotesApp2x.handle(m, liveMeeting, msgBus)
      case m: ClearSharedNotePubMsg => sharedNotesApp2x.handle(m, liveMeeting, msgBus)
      case m: UpdateSharedNoteReqMsg => sharedNotesApp2x.handle(m, liveMeeting, msgBus)
      case m: CreateSharedNoteReqMsg => sharedNotesApp2x.handle(m, liveMeeting, msgBus)
      case m: DestroySharedNoteReqMsg => sharedNotesApp2x.handle(m, liveMeeting, msgBus)

      // Guests
      case m: GetGuestsWaitingApprovalReqMsg => handleGetGuestsWaitingApprovalReqMsg(m)
      case m: SetGuestPolicyCmdMsg => handleSetGuestPolicyMsg(m)
      case m: GuestsWaitingApprovedMsg => handleGuestsWaitingApprovedMsg(m)
      case m: GetGuestPolicyReqMsg => handleGetGuestPolicyReqMsg(m)

      // Chat
      case m: GetChatHistoryReqMsg => chatApp2x.handle(m, liveMeeting, msgBus)
      case m: SendPublicMessagePubMsg => chatApp2x.handle(m, liveMeeting, msgBus)
      case m: SendPrivateMessagePubMsg => chatApp2x.handle(m, liveMeeting, msgBus)
      case m: ClearPublicChatHistoryPubMsg => state = chatApp2x.handle(m, state, liveMeeting, msgBus)

      // Screenshare
      case m: ScreenshareStartedVoiceConfEvtMsg => screenshareApp2x.handle(m, liveMeeting, msgBus)
      case m: ScreenshareStoppedVoiceConfEvtMsg => screenshareApp2x.handle(m, liveMeeting, msgBus)
      case m: ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg => screenshareApp2x.handle(m, liveMeeting, msgBus)
      case m: ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg => screenshareApp2x.handle(m, liveMeeting, msgBus)
      case m: GetScreenshareStatusReqMsg => screenshareApp2x.handle(m, liveMeeting, msgBus)

      // GroupChat
      case m: CreateGroupChatReqMsg => state = groupChatApp.handle(m, state, liveMeeting, msgBus)
      case m: GetGroupChatMsgsReqMsg => state = groupChatApp.handle(m, state, liveMeeting, msgBus)
      case m: GetGroupChatsReqMsg => state = groupChatApp.handle(m, state, liveMeeting, msgBus)
      case m: SendGroupChatMessageMsg => state = groupChatApp.handle(m, state, liveMeeting, msgBus)

      case m: ValidateConnAuthTokenSysMsg => handleValidateConnAuthTokenSysMsg(m)

      case _ => log.warning("***** Cannot handle " + msg.envelope.name)
    }
  }

  def handleGetAllMeetingsReqMsg(msg: GetAllMeetingsReqMsg): Unit = {
    // sync all meetings
    handleSyncGetMeetingInfoRespMsg(liveMeeting.props)

    // sync all users
    usersApp.handleSyncGetUsersMeetingRespMsg()

    // sync all presentations
    presentationApp2x.handle(liveMeeting, msgBus)

    // TODO send all chat
    // TODO send all lock settings
    // TODO send all screen sharing info
  }

  def handlePresenterChange(msg: AssignPresenterReqMsg): Unit = {
    // Stop poll if one is running as presenter left
    pollApp.stopPoll(state, msg.header.userId, liveMeeting, msgBus)

    // switch user presenter status for old and new presenter
    usersApp.handleAssignPresenterReqMsg(msg)

    // request screenshare to end
    screenshareApp2x.handleScreenshareStoppedVoiceConfEvtMsg(
      liveMeeting.props.voiceProp.voiceConf,
      liveMeeting.props.screenshareProps.screenshareConf,
      liveMeeting, msgBus
    )

  }

  def handleDeskShareGetDeskShareInfoRequest(msg: DeskShareGetDeskShareInfoRequest): Unit = {

    log.info("handleDeskShareGetDeskShareInfoRequest: " + msg.conferenceName + "isBroadcasting="
      + ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel) + " URL:" +
      ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel))

    if (ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel)) {
      // if the meeting has an ongoing WebRTC Deskshare session, send a notification
      //outGW.send(new DeskShareNotifyASingleViewer(props.meetingProp.intId, msg.requesterID,
      //  DeskshareModel.getRTMPBroadcastingUrl(liveMeeting.deskshareModel),
      //  DeskshareModel.getDesktopShareVideoWidth(liveMeeting.deskshareModel),
      //  DeskshareModel.getDesktopShareVideoHeight(liveMeeting.deskshareModel), true))
    }
  }

  def handleMonitorNumberOfUsers(msg: MonitorNumberOfUsersInternalMsg) {
    val (newState, expireReason) = ExpiryTrackerHelper.processMeetingInactivityAudit(outGW, eventBus, liveMeeting, state)
    state = newState
    expireReason foreach (reason => log.info("Meeting {} expired with reason {}", props.meetingProp.intId, reason))
    val (newState2, expireReason2) = ExpiryTrackerHelper.processMeetingExpiryAudit(outGW, eventBus, liveMeeting, state)
    state = newState2
    expireReason2 foreach (reason => log.info("Meeting {} expired with reason {}", props.meetingProp.intId, reason))

    sendRttTraceTest()
    setRecordingChapterBreak()
  }

  var lastRecBreakSentOn = expiryTracker.startedOnInMs

  def setRecordingChapterBreak(): Unit = {
    val now = TimeUtil.timeNowInMs()
    val elapsedInMs = now - lastRecBreakSentOn
    val elapsedInMin = TimeUtil.millisToMinutes(elapsedInMs)

    if (elapsedInMin > recordingChapterBreakLenghtInMinutes) {
      lastRecBreakSentOn = now
      val event = MsgBuilder.buildRecordingChapterBreakSysMsg(props.meetingProp.intId, TimeUtil.timeNowInMs())
      outGW.send(event)

      VoiceApp.stopRecordingVoiceConference(liveMeeting, outGW)

      val meetingId = liveMeeting.props.meetingProp.intId
      val recordFile = VoiceApp.genRecordPath(voiceConfRecordPath, meetingId, now)
      VoiceApp.startRecordingVoiceConference(liveMeeting, outGW, recordFile)

    }

  }

  def sendRttTraceTest(): Unit = {
    val now = System.currentTimeMillis()

    def buildDoLatencyTracerMsg(meetingId: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
      val envelope = BbbCoreEnvelope(DoLatencyTracerMsg.NAME, routing)
      val body = DoLatencyTracerMsgBody(now)
      val header = BbbClientMsgHeader(DoLatencyTracerMsg.NAME, meetingId, "not-used")
      val event = DoLatencyTracerMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    if (now - lastRttTestSentOn > 60000) {
      lastRttTestSentOn = now
      val event = buildDoLatencyTracerMsg(liveMeeting.props.meetingProp.intId)
      outGW.send(event)
    }

  }

  def handleExtendMeetingDuration(msg: ExtendMeetingDuration) {

  }

  def startRecordingIfAutoStart() {
    if (props.recordProp.record && !MeetingStatus2x.isRecording(liveMeeting.status) &&
      props.recordProp.autoStartRecording && Users2x.numUsers(liveMeeting.users2x) == 1) {

      MeetingStatus2x.recordingStarted(liveMeeting.status)

      def buildRecordingStatusChangedEvtMsg(meetingId: String, userId: String, recording: Boolean): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
        val envelope = BbbCoreEnvelope(RecordingStatusChangedEvtMsg.NAME, routing)
        val body = RecordingStatusChangedEvtMsgBody(recording, userId)
        val header = BbbClientMsgHeader(RecordingStatusChangedEvtMsg.NAME, meetingId, userId)
        val event = RecordingStatusChangedEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val event = buildRecordingStatusChangedEvtMsg(
        liveMeeting.props.meetingProp.intId,
        "system", MeetingStatus2x.isRecording(liveMeeting.status)
      )
      outGW.send(event)

    }
  }

  def stopAutoStartedRecording() {
    if (props.recordProp.record && MeetingStatus2x.isRecording(liveMeeting.status) &&
      props.recordProp.autoStartRecording && Users2x.numUsers(liveMeeting.users2x) == 0) {
      log.info("Last web user left. Auto stopping recording. meetingId={}", props.meetingProp.intId)
      MeetingStatus2x.recordingStopped(liveMeeting.status)

      def buildRecordingStatusChangedEvtMsg(meetingId: String, userId: String, recording: Boolean): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
        val envelope = BbbCoreEnvelope(RecordingStatusChangedEvtMsg.NAME, routing)
        val body = RecordingStatusChangedEvtMsgBody(recording, userId)
        val header = BbbClientMsgHeader(RecordingStatusChangedEvtMsg.NAME, meetingId, userId)
        val event = RecordingStatusChangedEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val event = buildRecordingStatusChangedEvtMsg(
        liveMeeting.props.meetingProp.intId,
        "system", MeetingStatus2x.isRecording(liveMeeting.status)
      )
      outGW.send(event)

    }
  }
}
