package org.bigbluebutton.core.running

import java.io.{ PrintWriter, StringWriter }
import org.apache.pekko.actor.SupervisorStrategy.Resume
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.apps.groupchats.GroupChatHdlrs
import org.bigbluebutton.core.apps.presentationpod._
import org.bigbluebutton.core.apps.users._
import org.bigbluebutton.core.apps.whiteboard.ClientToServerLatencyTracerMsgHdlr
import org.bigbluebutton.core.domain._
import org.bigbluebutton.core.util.TimeUtil
import org.bigbluebutton.common2.domain.{ DefaultProps, LockSettingsProps }
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.apps.caption.CaptionApp2x
import org.bigbluebutton.core.apps.chat.ChatApp2x
import org.bigbluebutton.core.apps.externalvideo.ExternalVideoApp2x
import org.bigbluebutton.core.apps.pads.{ PadsApp2x, PadslHdlrHelpers }
import org.bigbluebutton.core.apps.screenshare.ScreenshareApp2x
import org.bigbluebutton.core.apps.audiocaptions.AudioCaptionsApp2x
import org.bigbluebutton.core.apps.timer.TimerApp2x
import org.bigbluebutton.core.apps.presentation.PresentationApp2x
import org.bigbluebutton.core.apps.users.UsersApp2x
import org.bigbluebutton.core.apps.webcam.WebcamApp2x
import org.bigbluebutton.core.apps.whiteboard.WhiteboardApp2x
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.models.{ Users2x, VoiceUsers, _ }
import org.bigbluebutton.core2.{ MeetingStatus2x, Permissions }
import org.bigbluebutton.core2.message.handlers._
import org.bigbluebutton.core2.message.handlers.meeting._
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.breakout._
import org.bigbluebutton.core.apps.polls._
import org.bigbluebutton.core.apps.voice._
import org.apache.pekko.actor.Props
import org.apache.pekko.actor.OneForOneStrategy
import org.bigbluebutton.ClientSettings.{ getConfigPropertyValueByPathAsBooleanOrElse, getConfigPropertyValueByPathAsIntOrElse, getConfigPropertyValueByPathAsStringOrElse }
import org.bigbluebutton.common2.msgs
import scala.concurrent.duration._
import org.bigbluebutton.core.apps.layout.LayoutApp2x
import org.bigbluebutton.core.apps.plugin.PluginHdlrs
import org.bigbluebutton.core.apps.users.ChangeLockSettingsInMeetingCmdMsgHdlr
import org.bigbluebutton.core.db.{ MeetingDAO, NotificationDAO, TimerDAO, UserStateDAO }
import org.bigbluebutton.core.models.VoiceUsers.{ findAllFreeswitchCallers, findAllListenOnlyVoiceUsers }
import org.bigbluebutton.core.models.Webcams.findAll
import org.bigbluebutton.core2.MeetingStatus2x.hasAuthedUserJoined
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, Sender }

import java.util.concurrent.TimeUnit
import scala.concurrent.ExecutionContext.Implicits.global

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
  with SystemConfiguration
  with GuestsApp
  with LayoutApp2x
  with VoiceApp2x
  with BreakoutApp2x
  with UsersApp2x

  with UserJoinMeetingReqMsgHdlr
  with UserEstablishedGraphqlConnectionInternalMsgHdlr
  with UserConnectedToGlobalAudioMsgHdlr
  with UserDisconnectedFromGlobalAudioMsgHdlr
  with MuteAllExceptPresentersCmdMsgHdlr
  with MuteMeetingCmdMsgHdlr
  with IsMeetingMutedReqMsgHdlr
  with GetGlobalAudioPermissionReqMsgHdlr
  with GetMicrophonePermissionReqMsgHdlr
  with GetScreenBroadcastPermissionReqMsgHdlr
  with GetScreenSubscribePermissionReqMsgHdlr

  with EjectUserFromVoiceCmdMsgHdlr
  with EndMeetingSysCmdMsgHdlr
  with DestroyMeetingSysCmdMsgHdlr
  with ChangeLockSettingsInMeetingCmdMsgHdlr
  with ClientToServerLatencyTracerMsgHdlr
  with UserActivitySignCmdMsgHdlr {

  object CheckVoiceRecordingInternalMsg
  object SyncVoiceUserStatusInternalMsg
  object MeetingTasksExecutor
  object MeetingInfoAnalyticsMsg
  object MeetingInfoAnalyticsLogMsg

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
  val audioCaptionsApp2x = new AudioCaptionsApp2x
  val captionApp2x = new CaptionApp2x
  val chatApp2x = new ChatApp2x
  val externalVideoApp2x = new ExternalVideoApp2x
  val padsApp2x = new PadsApp2x
  val usersApp = new UsersApp(liveMeeting, outGW, eventBus)
  val groupChatApp = new GroupChatHdlrs
  val presentationPodsApp = new PresentationPodHdlrs
  val pollApp = new PollApp2x
  val webcamApp2x = new WebcamApp2x
  val wbApp = new WhiteboardApp2x
  val timerApp2x = new TimerApp2x
  val pluginHdlrs = new PluginHdlrs

  object ExpiryTrackerHelper extends MeetingExpiryTrackerHelper

  val expiryTracker = new MeetingExpiryTracker(
    startedOnInMs = TimeUtil.timeNowInMs(),
    userHasJoined = false,
    moderatorHasJoined = false,
    isBreakout = props.meetingProp.isBreakout,
    lastUserLeftOnInMs = None,
    lastModeratorLeftOnInMs = 0,
    durationInMs = TimeUtil.minutesToMillis(props.durationProps.duration),
    meetingExpireIfNoUserJoinedInMs = TimeUtil.minutesToMillis(props.durationProps.meetingExpireIfNoUserJoinedInMinutes),
    meetingExpireWhenLastUserLeftInMs = TimeUtil.minutesToMillis(props.durationProps.meetingExpireWhenLastUserLeftInMinutes),
    userInactivityInspectTimerInMs = TimeUtil.minutesToMillis(props.durationProps.userInactivityInspectTimerInMinutes),
    userInactivityThresholdInMs = TimeUtil.minutesToMillis(props.durationProps.userInactivityThresholdInMinutes),
    userActivitySignResponseDelayInMs = TimeUtil.minutesToMillis(props.durationProps.userActivitySignResponseDelayInMinutes),
    endWhenNoModerator = props.durationProps.endWhenNoModerator,
    endWhenNoModeratorDelayInMs = TimeUtil.minutesToMillis(props.durationProps.endWhenNoModeratorDelayInMinutes)
  )

  val recordingTracker = new MeetingRecordingTracker(startedOnInMs = 0L, previousDurationInMs = 0L)

  var state = new MeetingState2x(
    new GroupChats(Map.empty),
    new PresentationPodManager(Map.empty),
    None,
    None,
    expiryTracker,
    recordingTracker
  )

  var lastRttTestSentOn = System.currentTimeMillis()

  // Send new 2x message
  val msgEvent = MsgBuilder.buildMeetingCreatedEvtMsg(liveMeeting.props.meetingProp.intId, liveMeeting.props)
  outGW.send(msgEvent)

  //Insert meeting into the database
  MeetingDAO.insert(liveMeeting.props, liveMeeting.clientSettings)

  // Create a default public group chat
  state = groupChatApp.handleCreateDefaultPublicGroupChat(state, liveMeeting, msgBus)

  //state = GroupChatApp.genTestChatMsgHistory(GroupChatApp.MAIN_PUBLIC_CHAT, state, BbbSystemConst.SYSTEM_USER, liveMeeting)
  // Create a default public group chat **DEPRECATED, NOT GOING TO WORK ANYMORE**
  //state = GroupChatApp.createDefaultPublicGroupChat("TEST_GROUP_CHAT", state)
  //state = GroupChatApp.genTestChatMsgHistory("TEST_GROUP_CHAT", state, BbbSystemConst.SYSTEM_USER, liveMeeting)

  log.debug("NUM GROUP CHATS = " + state.groupChats.findAllPublicChats().length)

  // Create a default Presentation Pod
  state = presentationPodsApp.handleCreateDefaultPresentationPod(state, liveMeeting, msgBus)

  log.debug("NUM Presentation Pods = " + state.presentationPodManager.getNumberOfPods())

  // Initialize if the meeting is muted on start
  if (props.voiceProp.muteOnStart) {
    MeetingStatus2x.muteMeeting(liveMeeting.status)
  } else {
    MeetingStatus2x.unmuteMeeting(liveMeeting.status)
  }

  // Set webcamsOnlyForModerator property in case we didn't after meeting creation
  MeetingStatus2x.setWebcamsOnlyForModerator(liveMeeting.status, liveMeeting.props.usersProp.webcamsOnlyForModerator)

  initLockSettings(liveMeeting, liveMeeting.props.lockSettingsProps)

  initSharedNotes(liveMeeting)
  initTimer(liveMeeting)

  /** *****************************************************************/
  // Helper to create fake users for testing (ralam jan 5, 2018)
  //object FakeTestData extends FakeTestData
  //FakeTestData.createFakeUsers(liveMeeting)
  /** *****************************************************************/

  context.system.scheduler.schedule(
    5 seconds,
    syncVoiceUsersStatusInterval seconds,
    self,
    SyncVoiceUserStatusInternalMsg
  )

  context.system.scheduler.schedule(
    5 seconds,
    checkVoiceRecordingInterval seconds,
    self,
    CheckVoiceRecordingInternalMsg
  )

  context.system.scheduler.scheduleOnce(
    10 seconds,
    self,
    MeetingInfoAnalyticsLogMsg
  )

  context.system.scheduler.schedule(
    10 seconds,
    30 seconds,
    self,
    MeetingInfoAnalyticsMsg
  )

  context.system.scheduler.schedule(
    5 seconds,
    5 seconds,
    self,
    MeetingTasksExecutor
  )

  def receive = {
    case SyncVoiceUserStatusInternalMsg =>
      checkVoiceConfUsersStatus()
    case CheckVoiceRecordingInternalMsg =>
      checkVoiceConfIsRunningAndRecording()
    case MeetingInfoAnalyticsLogMsg =>
      handleMeetingInfoAnalyticsLogging()
    case MeetingInfoAnalyticsMsg =>
      handleMeetingInfoAnalyticsService()
    case MeetingTasksExecutor =>
      handleMeetingTasksExecutor()
    //=============================

    // 2x messages
    case msg: BbbCommonEnvCoreMsg                 => handleBbbCommonEnvCoreMsg(msg)

    // Handling RegisterUserReqMsg as it is forwarded from BBBActor and
    // its type is not BbbCommonEnvCoreMsg
    case m: RegisterUserReqMsg                    => usersApp.handleRegisterUserReqMsg(m)
    case m: RegisterUserSessionTokenReqMsg        => usersApp.handleRegisterUserSessionTokenReqMsg(m)

    //API Msgs
    case m: GetUserApiMsg                         => usersApp.handleGetUserApiMsg(m, sender)

    // Meeting
    case m: DestroyMeetingSysCmdMsg               => handleDestroyMeetingSysCmdMsg(m)

    //======================================

    //=======================================
    // internal messages
    case msg: MonitorNumberOfUsersInternalMsg     => handleMonitorNumberOfUsers(msg)
    case msg: MonitorGuestWaitPresenceInternalMsg => handleMonitorGuestWaitPresenceInternalMsg(msg)
    case msg: SetPresenterInDefaultPodInternalMsg => state = presentationPodsApp.handleSetPresenterInDefaultPodInternalMsg(msg, state, liveMeeting, msgBus)
    case msg: UserClosedAllGraphqlConnectionsInternalMsg =>
      state = handleUserClosedAllGraphqlConnectionsInternalMsg(msg, state)
      updateModeratorsPresence()
    case msg: UserEstablishedGraphqlConnectionInternalMsg =>
      state = handleUserEstablishedGraphqlConnectionInternalMsg(msg, state)
      updateModeratorsPresence()

    case msg: ExtendMeetingDuration                => handleExtendMeetingDuration(msg)
    case msg: BreakoutRoomCreatedInternalMsg       => state = handleBreakoutRoomCreatedInternalMsg(msg, state)
    case msg: SendBreakoutUsersAuditInternalMsg    => handleSendBreakoutUsersUpdateInternalMsg(msg)
    case msg: BreakoutRoomUsersUpdateInternalMsg   => state = handleBreakoutRoomUsersUpdateInternalMsg(msg, state)
    case msg: EndBreakoutRoomInternalMsg           => handleEndBreakoutRoomInternalMsg(msg)
    case msg: UpdateBreakoutRoomTimeInternalMsg    => state = handleUpdateBreakoutRoomTimeInternalMsgHdlr(msg, state)
    case msg: EjectUserFromBreakoutInternalMsg     => handleEjectUserFromBreakoutInternalMsgHdlr(msg)
    case msg: BreakoutRoomEndedInternalMsg         => state = handleBreakoutRoomEndedInternalMsg(msg, state)
    case msg: SendMessageToBreakoutRoomInternalMsg => state = handleSendMessageToBreakoutRoomInternalMsg(msg, state, liveMeeting, msgBus)
    case msg: CapturePresentationReqInternalMsg    => presentationPodsApp.handle(msg, state, liveMeeting, msgBus)

    case _                                         => // do nothing
  }

  private def initLockSettings(liveMeeting: LiveMeeting, lockSettingsProp: LockSettingsProps): Unit = {
    val settings = Permissions(
      disableCam = lockSettingsProp.disableCam,
      disableMic = lockSettingsProp.disableMic,
      disablePrivChat = lockSettingsProp.disablePrivateChat,
      disablePubChat = lockSettingsProp.disablePublicChat,
      disableNotes = lockSettingsProp.disableNotes,
      hideUserList = lockSettingsProp.hideUserList,
      lockOnJoin = lockSettingsProp.lockOnJoin,
      lockOnJoinConfigurable = lockSettingsProp.lockOnJoinConfigurable,
      hideViewersCursor = lockSettingsProp.hideViewersCursor,
      hideViewersAnnotation = lockSettingsProp.hideViewersAnnotation
    )

    MeetingStatus2x.initializePermissions(liveMeeting.status)
    MeetingStatus2x.setPermissions(liveMeeting.status, settings)
  }

  private def initSharedNotes(liveMeeting: LiveMeeting): Unit = {
    val sharedNotesEnabledInClientSettings = getConfigPropertyValueByPathAsBooleanOrElse(
      liveMeeting.clientSettings,
      "public.notes.enabled",
      alternativeValue = true
    )

    if (sharedNotesEnabledInClientSettings && !liveMeeting.props.meetingProp.disabledFeatures.contains("sharedNotes")) {
      val sharedNotesPadId = getConfigPropertyValueByPathAsStringOrElse(
        liveMeeting.clientSettings,
        "public.notes.id",
        alternativeValue = ""
      )

      if (!Pads.hasGroup(liveMeeting.pads, sharedNotesPadId)) {
        Pads.addGroup(liveMeeting.pads, sharedNotesPadId, sharedNotesPadId, sharedNotesPadId, "SYSTEM")
        PadslHdlrHelpers.broadcastPadCreateGroupCmdMsg(outGW, liveMeeting.props.meetingProp.intId, sharedNotesPadId, sharedNotesPadId)
      }
    }
  }

  private def initTimer(liveMeeting: LiveMeeting): Unit = {
    val timerEnabled = getConfigPropertyValueByPathAsBooleanOrElse(
      liveMeeting.clientSettings,
      "public.timer.enabled",
      alternativeValue = true
    )

    if (timerEnabled) {
      val timerDefaultTimeInMinutes = getConfigPropertyValueByPathAsIntOrElse(liveMeeting.clientSettings, "public.timer.time", 5)
      val timerDefaultTimeInMilli = timerDefaultTimeInMinutes * 60000
      TimerModel.createTimer(liveMeeting.timerModel, time = timerDefaultTimeInMilli)
      TimerDAO.insert(liveMeeting.props.meetingProp.intId, liveMeeting.timerModel)
    }
  }

  private def updateVoiceUserLastActivity(userId: String) {
    for {
      vu <- VoiceUsers.findWithVoiceUserId(liveMeeting.voiceUsers, userId)
    } yield {
      updateUserLastActivity(vu.intId)
    }
  }

  private def updateUserLastActivity(userId: String) {
    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, userId)
    } yield {
      Users2x.updateLastUserActivity(liveMeeting.users2x, user)
    }
  }

  private def updateModeratorsPresence() {
    if (Users2x.numActiveModerators(liveMeeting.users2x) > 0) {
      if (state.expiryTracker.moderatorHasJoined == false ||
        state.expiryTracker.lastModeratorLeftOnInMs != 0) {
        log.info("A moderator has joined. Setting setModeratorHasJoined(). meetingId=" + props.meetingProp.intId)
        val tracker = state.expiryTracker.setModeratorHasJoined()
        state = state.update(tracker)
      }
    } else {
      if (state.expiryTracker.moderatorHasJoined == true &&
        state.expiryTracker.lastModeratorLeftOnInMs == 0) {
        log.info("All moderators have left. Setting setLastModeratorLeftOn(). meetingId=" + props.meetingProp.intId)
        val tracker = state.expiryTracker.setLastModeratorLeftOn(TimeUtil.timeNowInMs())
        state = state.update(tracker)
      }
    }
  }

  private def endTimedOutBreakoutRooms(): Unit = {
    for {
      model <- state.breakout
      startedOn <- model.startedOn
    } yield {
      val endMeetingTime = TimeUtil.millisToSeconds(startedOn) + model.durationInSeconds
      val timeRemaining = endMeetingTime - TimeUtil.millisToSeconds(System.currentTimeMillis())

      if (timeRemaining < 0) {
        endAllBreakoutRooms(eventBus, liveMeeting, state, MeetingEndReason.BREAKOUT_ENDED_EXCEEDING_DURATION)
      }
    }
  }

  private def updateUserLastInactivityInspect(userId: String) {
    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, userId)
    } yield {
      Users2x.updateLastInactivityInspect(liveMeeting.users2x, user)
    }
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      case m: ClientToServerLatencyTracerMsg => handleClientToServerLatencyTracerMsg(m)
      case m: CheckRunningAndRecordingVoiceConfEvtMsg => handleCheckRunningAndRecordingVoiceConfEvtMsg(m)
      case _ => handleMessageThatAffectsInactivity(msg)
    }
  }

  private def handleMessageThatAffectsInactivity(msg: BbbCommonEnvCoreMsg): Unit = {

    msg.core match {
      case m: EndMeetingSysCmdMsg => handleEndMeeting(m, state)

      // Users
      case m: UserJoinMeetingReqMsg =>
        state = handleUserJoinMeetingReqMsg(m, state)
        updateModeratorsPresence()
      case m: UserLeaveReqMsg =>
        state = handleUserLeaveReqMsg(m, state)
        updateModeratorsPresence()

      case m: UserJoinedVoiceConfEvtMsg =>
        handleUserJoinedVoiceConfEvtMsg(m)
        updateVoiceUserLastActivity(m.body.voiceUserId)
      case m: LogoutAndEndMeetingCmdMsg => usersApp.handleLogoutAndEndMeetingCmdMsg(m, state)
      case m: SetRecordingStatusCmdMsg =>
        state = usersApp.handleSetRecordingStatusCmdMsg(m, state)
        updateUserLastActivity(m.body.setBy)
      case m: RecordAndClearPreviousMarkersCmdMsg =>
        state = usersApp.handleRecordAndClearPreviousMarkersCmdMsg(m, state)
        updateUserLastActivity(m.body.setBy)
      case m: ChangeUserReactionEmojiReqMsg =>
        usersApp.handleChangeUserReactionEmojiReqMsg(m)
        updateUserLastActivity(m.header.userId)
      case m: ChangeUserRaiseHandReqMsg =>
        usersApp.handleChangeUserRaiseHandReqMsg(m)
        updateUserLastActivity(m.header.userId)
      case m: ChangeUserAwayReqMsg =>
        usersApp.handleChangeUserAwayReqMsg(m)
        updateUserLastActivity(m.header.userId)
      case m: ClearAllUsersReactionCmdMsg =>
        handleClearAllUsersReactionCmdMsg(m)
        updateUserLastActivity(m.header.userId)
      case m: ChangeUserPinStateReqMsg =>
        usersApp.handleChangeUserPinStateReqMsg(m)
        updateUserLastActivity(m.body.changedBy)
      case m: UserConnectionAliveReqMsg    => usersApp.handleUserConnectionAliveReqMsg(m)
      case m: SetUserSpeechLocaleReqMsg    => usersApp.handleSetUserSpeechLocaleReqMsg(m)
      case m: SetUserSpeechOptionsReqMsg   => usersApp.handleSetUserSpeechOptionsReqMsg(m)
      case m: GetRecordingStatusReqMsg     => usersApp.handleGetRecordingStatusReqMsg(m)
      case m: SetUserCaptionLocaleReqMsg   => usersApp.handleSetUserCaptionLocaleReqMsg(m)
      case m: SetUserClientSettingsReqMsg  => usersApp.handleSetUserClientSettingsReqMsg(m)
      case m: SetUserEchoTestRunningReqMsg => usersApp.handleSetUserEchoTestRunningReqMsg(m)

      // Client requested to eject user
      case m: EjectUserFromMeetingCmdMsg =>
        usersApp.handleEjectUserFromMeetingCmdMsg(m, state)
        updateUserLastActivity(m.body.ejectedBy)

      // Another part of system (e.g. bbb-apps) requested to eject user.
      case m: EjectUserFromMeetingSysMsg => usersApp.handleEjectUserFromMeetingSysMsg(m)
      case m: ChangeUserRoleCmdMsg =>
        usersApp.handleChangeUserRoleCmdMsg(m)
        updateUserLastActivity(m.body.changedBy)
        updateModeratorsPresence()

      // Whiteboard
      case m: SendCursorPositionPubMsg =>
        wbApp.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: ClearWhiteboardPubMsg =>
        wbApp.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: DeleteWhiteboardAnnotationsPubMsg =>
        wbApp.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: ModifyWhiteboardAccessPubMsg =>
        wbApp.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: SendWhiteboardAnnotationsPubMsg =>
        wbApp.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: GetWhiteboardAnnotationsReqMsg => wbApp.handle(m, liveMeeting, msgBus)

      // Poll
      case m: StartPollReqMsg =>
        pollApp.handle(m, state, liveMeeting, msgBus) // passing state but not modifying it
        updateUserLastActivity(m.body.requesterId)
      case m: StartCustomPollReqMsg =>
        pollApp.handle(m, state, liveMeeting, msgBus) // passing state but not modifying it
        updateUserLastActivity(m.body.requesterId)
      case m: StopPollReqMsg =>
        pollApp.handle(m, state, liveMeeting, msgBus) // passing state but not modifying it
        updateUserLastActivity(m.body.requesterId)
      case m: ShowPollResultReqMsg =>
        pollApp.handle(m, state, liveMeeting, msgBus) // passing state but not modifying it
        updateUserLastActivity(m.body.requesterId)
      case m: GetCurrentPollReqMsg => pollApp.handle(m, state, liveMeeting, msgBus) // passing state but not modifying it
      case m: RespondToPollReqMsg =>
        pollApp.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.body.requesterId)
      case m: RespondToTypedPollReqMsg =>
        pollApp.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.body.requesterId)

      // Breakout
      case m: BreakoutRoomsListMsg                 => state = handleBreakoutRoomsListMsg(m, state)
      case m: CreateBreakoutRoomsCmdMsg            => state = handleCreateBreakoutRoomsCmdMsg(m, state)
      case m: EndAllBreakoutRoomsMsg               => state = handleEndAllBreakoutRoomsMsg(m, state)
      case m: RequestBreakoutJoinURLReqMsg         => state = handleRequestBreakoutJoinURLReqMsg(m, state)
      case m: SetBreakoutRoomInviteDismissedReqMsg => handleSetBreakoutRoomInviteDismissedReqMsg(m)
      case m: TransferUserToMeetingRequestMsg      => state = handleTransferUserToMeetingRequestMsg(m, state)
      case m: UpdateBreakoutRoomsTimeReqMsg        => state = handleUpdateBreakoutRoomsTimeMsg(m, state)
      case m: SendMessageToAllBreakoutRoomsReqMsg  => state = handleSendMessageToAllBreakoutRoomsMsg(m, state)
      case m: ChangeUserBreakoutReqMsg             => state = handleChangeUserBreakoutReqMsg(m, state)

      // Voice
      case m: UserLeftVoiceConfEvtMsg              => handleUserLeftVoiceConfEvtMsg(m)
      case m: UserMutedInVoiceConfEvtMsg           => handleUserMutedInVoiceConfEvtMsg(m)
      case m: UserTalkingInVoiceConfEvtMsg =>
        updateVoiceUserLastActivity(m.body.voiceUserId)
        handleUserTalkingInVoiceConfEvtMsg(m)
      case m: VoiceConfCallStateEvtMsg        => handleVoiceConfCallStateEvtMsg(m)

      case m: RecordingStartedVoiceConfEvtMsg => handleRecordingStartedVoiceConfEvtMsg(m)
      case m: AudioFloorChangedVoiceConfEvtMsg =>
        handleAudioFloorChangedVoiceConfEvtMsg(m)
        audioCaptionsApp2x.handle(m, liveMeeting)
      case m: MuteUserCmdMsg =>
        usersApp.handleMuteUserCmdMsg(m)
        updateUserLastActivity(m.body.mutedBy)
      case m: MuteAllExceptPresentersCmdMsg =>
        handleMuteAllExceptPresentersCmdMsg(m)
        updateUserLastActivity(m.body.mutedBy)
      case m: EjectUserFromVoiceCmdMsg => handleEjectUserFromVoiceCmdMsg(m)
      case m: IsMeetingMutedReqMsg     => handleIsMeetingMutedReqMsg(m)
      case m: MuteMeetingCmdMsg =>
        handleMuteMeetingCmdMsg(m)
        updateUserLastActivity(m.body.mutedBy)
      case m: UserConnectedToGlobalAudioMsg      => handleUserConnectedToGlobalAudioMsg(m)
      case m: UserDisconnectedFromGlobalAudioMsg => handleUserDisconnectedFromGlobalAudioMsg(m)
      case m: VoiceConfRunningEvtMsg             => handleVoiceConfRunningEvtMsg(m)
      case m: UserStatusVoiceConfEvtMsg =>
        handleUserStatusVoiceConfEvtMsg(m)
      case m: GetGlobalAudioPermissionReqMsg =>
        handleGetGlobalAudioPermissionReqMsg(m)
      case m: GetMicrophonePermissionReqMsg =>
        handleGetMicrophonePermissionReqMsg(m)
      case m: ChannelHoldChangedVoiceConfEvtMsg =>
        handleChannelHoldChangedVoiceConfEvtMsg(m)
      case m: ListenOnlyModeToggledInSfuEvtMsg =>
        handleListenOnlyModeToggledInSfuEvtMsg(m)

      // Layout
      case m: GetCurrentLayoutReqMsg  => handleGetCurrentLayoutReqMsg(m)
      case m: BroadcastLayoutMsg      => handleBroadcastLayoutMsg(m)
      case m: BroadcastPushLayoutMsg  => handleBroadcastPushLayoutMsg(m)

      // Pads
      case m: PadGroupCreatedEvtMsg   => padsApp2x.handle(m, liveMeeting, msgBus)
      case m: PadCreateReqMsg         => padsApp2x.handle(m, liveMeeting, msgBus)
      case m: PadCreatedEvtMsg        => padsApp2x.handle(m, liveMeeting, msgBus)
      case m: PadCreateSessionReqMsg  => padsApp2x.handle(m, liveMeeting, msgBus)
      case m: PadSessionCreatedEvtMsg => padsApp2x.handle(m, liveMeeting, msgBus)
      case m: PadSessionDeletedSysMsg => padsApp2x.handle(m, liveMeeting, msgBus)
      case m: PadUpdatedSysMsg =>
        padsApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.body.userId)
      case m: PadContentSysMsg => padsApp2x.handle(m, liveMeeting, msgBus)
      case m: PadPatchSysMsg   => padsApp2x.handle(m, liveMeeting, msgBus)
      case m: PadUpdatePubMsg  => padsApp2x.handle(m, liveMeeting, msgBus)
      case m: PadPinnedReqMsg =>
        padsApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)

      // Lock Settings
      case m: ChangeLockSettingsInMeetingCmdMsg =>
        handleSetLockSettings(m)
        updateUserLastActivity(m.body.setBy)
      case m: LockUserInMeetingCmdMsg =>
        handleLockUserInMeetingCmdMsg(m)
        updateUserLastActivity(m.body.lockedBy)
      case m: ChangeUserLockSettingsInMeetingCmdMsg =>
        handleChangeUserLockSettingsInMeetingCmdMsg(m)
        updateUserLastActivity(m.body.setBy)
      case m: LockUsersInMeetingCmdMsg =>
        handleLockUsersInMeetingCmdMsg(m)
        updateUserLastActivity(m.body.lockedBy)

      // Presentation
      case m: PreuploadedPresentationsSysPubMsg => presentationApp2x.handle(m, liveMeeting, msgBus)
      case m: AssignPresenterReqMsg =>
        state = handlePresenterChange(m, state)
        updateUserLastActivity(m.body.assignedBy)
      case m: MakePresentationDownloadReqMsg =>
        presentationPodsApp.handle(m, state, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: NewPresFileAvailableMsg        => presentationPodsApp.handle(m, liveMeeting, msgBus)
      case m: PresAnnStatusMsg               => presentationPodsApp.handle(m, liveMeeting, msgBus)

      // Presentation Pods
      case m: CreateNewPresentationPodPubMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: RemovePresentationPodPubMsg =>
        state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: GetAllPresentationPodsReqMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: SetCurrentPresentationPubMsg =>
        state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: PresentationConversionCompletedSysPubMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PdfConversionInvalidErrorSysPubMsg       => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: SetCurrentPagePubMsg =>
        state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: SetPageInfiniteWhiteboardPubMsg                  => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: RemovePresentationPubMsg                         => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: SetPresentationDownloadablePubMsg                => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationConversionUpdateSysPubMsg            => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationUploadedFileTooLargeErrorSysPubMsg   => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationHasInvalidMimeTypeErrorSysPubMsg     => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationUploadedFileTimeoutErrorSysPubMsg    => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationUploadedFileVirusErrorSysPubMsg      => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationUploadedFileScanFailedErrorSysPubMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationPageGeneratedSysPubMsg               => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationPageCountErrorSysPubMsg              => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationUploadTokenReqMsg                    => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: ResizeAndMovePagePubMsg =>
        state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: SlideResizedPubMsg                      => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationPageConvertedSysMsg         => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationPageConversionStartedSysMsg => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)
      case m: PresentationConversionEndedSysMsg       => state = presentationPodsApp.handle(m, state, liveMeeting, msgBus)

      // Caption
      case m: EditCaptionHistoryPubMsg                => captionApp2x.handle(m, liveMeeting, msgBus)
      case m: AddCaptionLocalePubMsg                  => captionApp2x.handle(m, liveMeeting, msgBus)
      case m: SendCaptionHistoryReqMsg                => captionApp2x.handle(m, liveMeeting, msgBus)
      case m: CaptionSubmitTranscriptPubMsg           => captionApp2x.handle(m, liveMeeting, msgBus)

      // Guests
      case m: GetGuestsWaitingApprovalReqMsg          => handleGetGuestsWaitingApprovalReqMsg(m)
      case m: SetGuestPolicyCmdMsg =>
        handleSetGuestPolicyMsg(m)
        updateUserLastActivity(m.header.userId)
      case m: SetGuestLobbyMessageCmdMsg =>
        handleSetGuestLobbyMessageMsg(m)
        updateUserLastActivity(m.header.userId)
      case m: GuestsWaitingApprovedMsg =>
        handleGuestsWaitingApprovedMsg(m)
        updateUserLastActivity(m.header.userId)
      case m: GetGuestPolicyReqMsg               => handleGetGuestPolicyReqMsg(m)
      case m: UpdatePositionInWaitingQueueReqMsg => handleUpdatePositionInWaitingQueueReqMsg(m)
      case m: SetPrivateGuestLobbyMessageCmdMsg =>
        handleSetPrivateGuestLobbyMessageCmdMsg(m)
        updateUserLastActivity(m.header.userId)

      // Chat
      case m: GetChatHistoryReqMsg => chatApp2x.handle(m, liveMeeting, msgBus)
      case m: SendPublicMessagePubMsg =>
        chatApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.body.message.fromUserId)
      case m: SendPrivateMessagePubMsg =>
        chatApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.body.message.fromUserId)
      case m: ClearPublicChatHistoryPubMsg =>
        state = chatApp2x.handle(m, state, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: UserTypingPubMsg =>
        chatApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)

      // Screenshare
      case m: ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg => screenshareApp2x.handle(m, liveMeeting, msgBus)
      case m: ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg => screenshareApp2x.handle(m, liveMeeting, msgBus)
      case m: GetScreenshareStatusReqMsg                     => screenshareApp2x.handle(m, liveMeeting, msgBus)
      case m: GetScreenBroadcastPermissionReqMsg             => handleGetScreenBroadcastPermissionReqMsg(m)
      case m: GetScreenSubscribePermissionReqMsg             => handleGetScreenSubscribePermissionReqMsg(m)

      // AudioCaptions
      case m: UpdateTranscriptPubMsg =>
        audioCaptionsApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: TranscriptionProviderErrorMsg => audioCaptionsApp2x.handleTranscriptionProviderErrorMsg(m, liveMeeting, msgBus)

      // GroupChat
      case m: CreateGroupChatReqMsg =>
        state = groupChatApp.handle(m, state, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: SetGroupChatLastSeenReqMsg => groupChatApp.handle(m, liveMeeting)
      case m: SetGroupChatVisibleReqMsg  => groupChatApp.handle(m, liveMeeting)
      case m: GetGroupChatMsgsReqMsg     => state = groupChatApp.handle(m, state, liveMeeting, msgBus)
      case m: GetGroupChatsReqMsg        => state = groupChatApp.handle(m, state, liveMeeting, msgBus)
      case m: SendGroupChatMessageMsg =>
        state = groupChatApp.handle(m, state, liveMeeting, msgBus)
        updateUserLastActivity(m.body.msg.sender.id)
      case m: SendGroupChatMessageFromApiSysPubMsg =>
        state = groupChatApp.handle(m, state, liveMeeting, msgBus)
      case m: EditGroupChatMessageReqMsg =>
        state = groupChatApp.handle(m, state, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: DeleteGroupChatMessageReqMsg =>
        state = groupChatApp.handle(m, state, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: SendGroupChatMessageReactionReqMsg =>
        groupChatApp.handle(m, state, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: DeleteGroupChatMessageReactionReqMsg =>
        groupChatApp.handle(m, state, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)

      // Plugin
      case m: PluginDataChannelPushEntryMsg    => pluginHdlrs.handle(m, state, liveMeeting)
      case m: PluginDataChannelReplaceEntryMsg => pluginHdlrs.handle(m, state, liveMeeting)
      case m: PluginDataChannelDeleteEntryMsg  => pluginHdlrs.handle(m, state, liveMeeting)
      case m: PluginDataChannelResetMsg        => pluginHdlrs.handle(m, state, liveMeeting)

      // Webcams
      case m: UserBroadcastCamStartMsg =>
        webcamApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: UserBroadcastCamStopMsg =>
        webcamApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: SetCamShowAsContentReqMsg =>
        webcamApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: GetCamBroadcastPermissionReqMsg  => webcamApp2x.handle(m, liveMeeting, msgBus)
      case m: GetCamSubscribePermissionReqMsg  => webcamApp2x.handle(m, liveMeeting, msgBus)
      case m: CamStreamSubscribedInSfuEvtMsg   => webcamApp2x.handle(m, liveMeeting, msgBus)
      case m: CamStreamUnsubscribedInSfuEvtMsg => webcamApp2x.handle(m, liveMeeting, msgBus)
      case m: CamBroadcastStoppedInSfuEvtMsg   => webcamApp2x.handle(m, liveMeeting, msgBus)
      case m: EjectUserCamerasCmdMsg           => webcamApp2x.handle(m, liveMeeting, msgBus)
      case m: GetWebcamsOnlyForModeratorReqMsg => webcamApp2x.handle(m, liveMeeting, msgBus)
      case m: UpdateWebcamsOnlyForModeratorCmdMsg =>
        webcamApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.body.setBy)

      // ExternalVideo
      case m: StartExternalVideoPubMsg =>
        externalVideoApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: UpdateExternalVideoPubMsg => externalVideoApp2x.handle(m, liveMeeting, msgBus)
      case m: StopExternalVideoPubMsg =>
        externalVideoApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)

      //Timer
      case m: ActivateTimerReqMsg =>
        timerApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: DeactivateTimerReqMsg =>
        timerApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: StartTimerReqMsg =>
        timerApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: StopTimerReqMsg =>
        timerApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: SwitchTimerReqMsg =>
        timerApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: SetTimerReqMsg =>
        timerApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: ResetTimerReqMsg =>
        timerApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)
      case m: SetTrackReqMsg =>
        timerApp2x.handle(m, liveMeeting, msgBus)
        updateUserLastActivity(m.header.userId)

      case m: UserActivitySignCmdMsg => handleUserActivitySignCmdMsg(m)

      case _                         => log.warning("***** Cannot handle " + msg.envelope.name)
    }
  }

  private def handleMeetingInfoAnalyticsLogging(): Unit = {
    val meetingInfoAnalyticsLogMsg: MeetingInfoAnalytics = prepareMeetingInfo()
    val event = MsgBuilder.buildMeetingInfoAnalyticsMsg(meetingInfoAnalyticsLogMsg)
    outGW.send(event)
  }

  private def handleMeetingInfoAnalyticsService(): Unit = {
    val meetingInfoAnalyticsLogMsg: MeetingInfoAnalytics = prepareMeetingInfo()
    val event2 = MsgBuilder.buildMeetingInfoAnalyticsServiceMsg(meetingInfoAnalyticsLogMsg)
    outGW.send(event2)
  }

  private def handleMeetingTasksExecutor(): Unit = {
    clearExpiredReactionEmojis()
    stopFinishedTimer()
    endTimedOutBreakoutRooms()
  }

  private def clearExpiredReactionEmojis(): Unit = {
    val userReactionExpire = getConfigPropertyValueByPathAsIntOrElse(liveMeeting.clientSettings, "public.userReaction.expire", 30)
    val now = System.currentTimeMillis()

    for {
      user <- Users2x.findAll(liveMeeting.users2x)
    } yield {
      if (user.reactionEmoji != null && user.reactionEmoji != "none") {
        if (now - user.reactionChangedOn > userReactionExpire * 1000) {
          Users2x.setReactionEmoji(liveMeeting.users2x, user.intId, "none", 0)
        }
      }
    }
  }

  private def stopFinishedTimer(): Unit = {
    if (TimerModel.resetTimerIfFinished(liveMeeting.timerModel)) {
      TimerDAO.update(liveMeeting.props.meetingProp.intId, liveMeeting.timerModel)
    }
  }

  private def prepareMeetingInfo(): MeetingInfoAnalytics = {
    val meetingName: String = liveMeeting.props.meetingProp.name
    val externalId: String = liveMeeting.props.meetingProp.extId
    val internalId: String = liveMeeting.props.meetingProp.intId
    val hasUserJoined: Boolean = hasAuthedUserJoined(liveMeeting.status)
    val isMeetingRecorded = MeetingStatus2x.isRecording(liveMeeting.status)

    // TODO: Placeholder values as required values not available
    val screenshareStream: ScreenshareStream = ScreenshareStream(new User("", ""), List())
    val screenshare: Screenshare = Screenshare(screenshareStream)

    val listOfUsers: List[UserState] = Users2x.findAll(liveMeeting.users2x).toList
    val breakoutRoomNames: List[String] = {
      if (state.breakout.isDefined)
        state.breakout.get.getRooms.map(_.name).toList
      else
        List()
    }
    val breakoutRoom: BreakoutRoom = BreakoutRoom(liveMeeting.props.breakoutProps.parentId, breakoutRoomNames)
    MeetingInfoAnalytics(
      meetingName, externalId, internalId, hasUserJoined, isMeetingRecorded, getMeetingInfoWebcamDetails, getMeetingInfoAudioDetails,
      screenshare, listOfUsers.map(u => Participant(u.intId, u.name, u.role)), getMeetingInfoPresentationDetails, breakoutRoom
    )
  }

  private def resolveUserName(userId: String): String = {
    val userName: String = Users2x.findWithIntId(liveMeeting.users2x, userId).map(_.name).getOrElse("")
    if (userName.isEmpty) log.error(s"Failed to map username for id $userId")
    userName
  }

  private def getMeetingInfoWebcamDetails(): Webcam = {
    val liveWebcams: Vector[org.bigbluebutton.core.models.WebcamStream] = findAll(liveMeeting.webcams)
    val numOfLiveWebcams: Int = liveWebcams.length
    val broadcasts: List[Broadcast] = liveWebcams.map(webcam => Broadcast(
      webcam.streamId,
      User(webcam.userId, resolveUserName(webcam.userId)), 0L
    )).toList
    val subscribers: Set[String] = liveWebcams.flatMap(_.subscribers).toSet
    val webcamStream: msgs.WebcamStream = msgs.WebcamStream(broadcasts, subscribers)
    Webcam(numOfLiveWebcams, webcamStream)
  }

  private def getMeetingInfoAudioDetails(): Audio = {
    val voiceUsers: Vector[VoiceUserState] = VoiceUsers.findAll(liveMeeting.voiceUsers)
    val numOfVoiceUsers: Int = voiceUsers.length

    val listenOnlyUsers: Vector[VoiceUserState] = findAllListenOnlyVoiceUsers(liveMeeting.voiceUsers)
    val numOfListenOnlyUsers: Int = listenOnlyUsers.length
    val listenOnlyAudio = ListenOnlyAudio(
      numOfListenOnlyUsers,
      listenOnlyUsers.map(voiceUserState => User(voiceUserState.voiceUserId, resolveUserName(voiceUserState.intId))).toList
    )

    val freeswitchUsers: Vector[VoiceUserState] = findAllFreeswitchCallers(liveMeeting.voiceUsers)
    val numOfFreeswitchUsers: Int = freeswitchUsers.length
    val twoWayAudio = TwoWayAudio(
      numOfFreeswitchUsers,
      freeswitchUsers.map(voiceUserState => User(voiceUserState.voiceUserId, resolveUserName(voiceUserState.intId))).toList
    )

    // TODO: Placeholder values
    val phoneAudio = PhoneAudio(0, List())

    Audio(numOfVoiceUsers, listenOnlyAudio, twoWayAudio, phoneAudio)
  }

  private def getMeetingInfoPresentationDetails(): PresentationInfo = {
    val presentationPods: Vector[PresentationPod] = state.presentationPodManager.getAllPresentationPodsInMeeting()
    val presentationId: String = presentationPods.flatMap(_.getCurrentPresentation.map(_.id)).mkString
    val presentationName: String = presentationPods.flatMap(_.getCurrentPresentation.map(_.name)).mkString
    PresentationInfo(presentationId, presentationName)
  }

  def handlePresenterChange(msg: AssignPresenterReqMsg, state: MeetingState2x): MeetingState2x = {
    // Stop poll if one is running as presenter left
    pollApp.stopPoll(state, msg.header.userId, liveMeeting, msgBus)

    // switch user presenter status for old and new presenter
    val newState = usersApp.handleAssignPresenterReqMsg(msg, state)

    newState

  }

  def handleMonitorNumberOfUsers(msg: MonitorNumberOfUsersInternalMsg) {
    state = removeUsersWithExpiredUserLeftFlag(liveMeeting, state)

    if (!liveMeeting.props.meetingProp.isBreakout) {
      // Track expiry only for non-breakout rooms. The breakout room lifecycle is
      // driven by the parent meeting.
      val (newState, expireReason) = ExpiryTrackerHelper.processMeetingExpiryAudit(outGW, eventBus, liveMeeting, state)
      state = newState
      expireReason foreach (reason => log.info("Meeting {} expired with reason {}", props.meetingProp.intId, reason))
    }

    sendRttTraceTest()
    setRecordingChapterBreak()

    processUserInactivityAudit()
    checkIfNeedToEndMeetingWhenNoAuthedUsers(liveMeeting)
    checkIfNeedToEndMeetingWhenNoModerators(liveMeeting)
  }

  def handleMonitorGuestWaitPresenceInternalMsg(msg: MonitorGuestWaitPresenceInternalMsg) {
    if (liveMeeting.props.usersProp.waitingGuestUsersTimeout > 0) {
      for {
        regUser <- RegisteredUsers.findAll(liveMeeting.registeredUsers)
      } yield {
        if (!regUser.loggedOut
          && !regUser.ejected
          && regUser.guestStatus == GuestStatus.WAIT
          && !regUser.graphqlConnected
          && regUser.graphqlDisconnectedOn != 0) {
          val diff = System.currentTimeMillis() - regUser.graphqlDisconnectedOn
          if (diff > liveMeeting.props.usersProp.waitingGuestUsersTimeout) {
            GuestsWaiting.remove(liveMeeting.guestsWaiting, regUser.id)
            UsersApp.guestWaitingLeft(liveMeeting, regUser.id, outGW)
          }
        }
      }
    }
  }

  def checkVoiceConfUsersStatus(): Unit = {
    val event = MsgBuilder.buildLastcheckVoiceConfUsersStatus(
      props.meetingProp.intId,
      props.voiceProp.voiceConf
    )
    outGW.send(event)
  }

  def checkVoiceConfIsRunningAndRecording(): Unit = {
    val event = MsgBuilder.buildCheckRunningAndRecordingToVoiceConfSysMsg(
      props.meetingProp.intId,
      props.voiceProp.voiceConf
    )
    outGW.send(event)
  }

  var lastRecBreakSentOn = expiryTracker.startedOnInMs

  def setRecordingChapterBreak(): Unit = {
    val now = System.currentTimeMillis()
    val elapsedInMs = now - lastRecBreakSentOn
    val elapsedInMin = TimeUtil.millisToMinutes(elapsedInMs)

    if (props.recordProp.record &&
      (MeetingStatus2x.isRecording(liveMeeting.status) || props.recordProp.recordFullDurationMedia) &&
      recordingChapterBreakLengthInMinutes > 0 &&
      elapsedInMin > recordingChapterBreakLengthInMinutes) {
      lastRecBreakSentOn = now
      val event = MsgBuilder.buildRecordingChapterBreakSysMsg(props.meetingProp.intId, TimeUtil.timeNowInMs())
      outGW.send(event)

      VoiceApp.stopRecordingVoiceConference(liveMeeting, outGW)
      VoiceApp.startRecordingVoiceConference(liveMeeting, outGW)
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

  private def checkIfNeedToEndMeetingWhenNoAuthedUsers(liveMeeting: LiveMeeting): Unit = {
    val authUserJoined = MeetingStatus2x.hasAuthedUserJoined(liveMeeting.status)

    if (endMeetingWhenNoMoreAuthedUsers &&
      !liveMeeting.props.meetingProp.isBreakout &&
      authUserJoined) {
      val lastAuthedUserLeftLimitMs = TimeUtil.timeNowInMs() - MeetingStatus2x.getLastAuthedUserLeftOn(liveMeeting.status)
      if (lastAuthedUserLeftLimitMs > TimeUtil.minutesToMillis(endMeetingWhenNoMoreAuthedUsersAfterMinutes)) {
        val authedUsers = Users2x.findAllAuthedUsers(liveMeeting.users2x)

        if (authedUsers.isEmpty) {
          sendEndMeetingDueToExpiry(
            MeetingEndReason.ENDED_DUE_TO_NO_AUTHED_USER,
            eventBus, outGW, liveMeeting,
            "system"
          )
        }
      }
    }
  }

  private def checkIfNeedToEndMeetingWhenNoModerators(liveMeeting: LiveMeeting): Unit = {
    if (state.expiryTracker.endWhenNoModerator &&
      !liveMeeting.props.meetingProp.isBreakout &&
      state.expiryTracker.moderatorHasJoined &&
      state.expiryTracker.lastModeratorLeftOnInMs != 0 &&
      //Check if has moderator with leftFlag
      Users2x.findModerator(liveMeeting.users2x).toVector.length == 0) {
      val hasModeratorLeftRecently = (TimeUtil.timeNowInMs() - state.expiryTracker.endWhenNoModeratorDelayInMs) < state.expiryTracker.lastModeratorLeftOnInMs
      if (!hasModeratorLeftRecently) {
        log.info("Meeting will end due option endWhenNoModerator is enabled and all moderators have left the meeting. meetingId=" + props.meetingProp.intId)
        endAllBreakoutRooms(eventBus, liveMeeting, state, MeetingEndReason.ENDED_DUE_TO_NO_MODERATOR)
        sendEndMeetingDueToExpiry(
          MeetingEndReason.ENDED_DUE_TO_NO_MODERATOR,
          eventBus, outGW, liveMeeting,
          "system"
        )
      } else {
        val msToEndMeeting = state.expiryTracker.lastModeratorLeftOnInMs - (TimeUtil.timeNowInMs() - state.expiryTracker.endWhenNoModeratorDelayInMs)
        log.info("All moderators have left. Meeting will end in " + TimeUtil.millisToSeconds(msToEndMeeting) + " seconds. meetingId=" + props.meetingProp.intId)
      }
    }
  }

  def handleExtendMeetingDuration(msg: ExtendMeetingDuration) = ???

  def removeUsersWithExpiredUserLeftFlag(liveMeeting: LiveMeeting, state: MeetingState2x): MeetingState2x = {
    val leftUsers = Users2x.findAllExpiredUserLeftFlags(liveMeeting.users2x, expiryTracker.meetingExpireWhenLastUserLeftInMs)
    leftUsers foreach { leftUser =>
      for {
        u <- Users2x.remove(liveMeeting.users2x, leftUser.intId)
        ru <- RegisteredUsers.findWithUserId(leftUser.intId, liveMeeting.registeredUsers)
      } yield {
        log.info("Removing user from meeting. meetingId=" + props.meetingProp.intId + " userId=" + u.intId + " user=" + u)

        RegisteredUsers.updateUserJoin(liveMeeting.registeredUsers, ru, joined = false)

        // send a user left event for the clients to update
        val userLeftMeetingEvent = MsgBuilder.buildUserLeftMeetingEvtMsg(liveMeeting.props.meetingProp.intId, u.intId)
        outGW.send(userLeftMeetingEvent)

        val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
          liveMeeting.props.meetingProp.intId,
          "info",
          "user",
          "app.notification.userLeavePushAlert",
          "Notification for a user leaves the meeting",
          Vector(s"${u.name}")
        )
        outGW.send(notifyEvent)
        NotificationDAO.insert(notifyEvent)

        if (u.presenter) {
          log.info("removeUsersWithExpiredUserLeftFlag will cause an automaticallyAssignPresenter because user={} left", u)
          UsersApp.automaticallyAssignPresenter(outGW, liveMeeting)

          // request ongoing poll to end
          Polls.handleStopPollReqMsg(state, u.intId, liveMeeting)
        }

        UserStateDAO.updateExpired(u.meetingId, u.intId, true)
      }
    }

    stopRecordingIfAutoStart2x(outGW, liveMeeting, state)

    if (liveMeeting.props.meetingProp.isBreakout) {
      BreakoutHdlrHelpers.updateParentMeetingWithUsers(liveMeeting, eventBus)
    }

    if (state.expiryTracker.userHasJoined &&
      Users2x.numUsers(liveMeeting.users2x) == 0
      && !state.expiryTracker.lastUserLeftOnInMs.isDefined) {
      log.info("Setting meeting no more users. meetingId=" + props.meetingProp.intId)
      val tracker = state.expiryTracker.setLastUserLeftOn(TimeUtil.timeNowInMs())
      state.update(tracker)
    } else {
      state
    }
  }

  var lastUsersInactivityInspection = System.currentTimeMillis()

  def processUserInactivityAudit(): Unit = {

    val now = System.currentTimeMillis()

    // Check if user is inactive. We only do the check is user inactivity
    // is not disabled (0).
    if ((expiryTracker.userInactivityInspectTimerInMs > 0) &&
      (now > lastUsersInactivityInspection + expiryTracker.userInactivityInspectTimerInMs)) {
      lastUsersInactivityInspection = now

      warnPotentiallyInactiveUsers()
      disconnectInactiveUsers()
    }

  }

  def warnPotentiallyInactiveUsers(): Unit = {
    log.info("Checking for inactive users.")
    val users = Users2x.findAll(liveMeeting.users2x)
    users foreach { u =>
      val hasActivityAfterWarning = u.lastInactivityInspect < u.lastActivityTime
      val hasActivityRecently = (lastUsersInactivityInspection - expiryTracker.userInactivityThresholdInMs) < u.lastActivityTime

      if (hasActivityAfterWarning && !hasActivityRecently) {
        log.info("User has been inactive for " + TimeUnit.MILLISECONDS.toMinutes(expiryTracker.userInactivityThresholdInMs) + " minutes. Sending inactivity warning. meetingId=" + props.meetingProp.intId + " userId=" + u.intId + " user=" + u)

        val secsToDisconnect = TimeUnit.MILLISECONDS.toSeconds(expiryTracker.userActivitySignResponseDelayInMs);
        Sender.sendUserInactivityInspectMsg(liveMeeting.props.meetingProp.intId, u.intId, secsToDisconnect, outGW)
        UserStateDAO.updateInactivityWarning(u.meetingId, u.intId, inactivityWarningDisplay = true, secsToDisconnect)
        updateUserLastInactivityInspect(u.intId)
      }
    }
  }

  def disconnectInactiveUsers(): Unit = {
    log.info("Check for users who haven't responded to user inactivity warning.")
    val users = Users2x.findAll(liveMeeting.users2x)
    users foreach { u =>
      val hasInactivityWarningSent = u.lastInactivityInspect != 0
      val hasActivityAfterWarning = u.lastInactivityInspect < u.lastActivityTime
      val respondedOnTime = (lastUsersInactivityInspection - expiryTracker.userActivitySignResponseDelayInMs) < u.lastInactivityInspect

      if (hasInactivityWarningSent && !hasActivityAfterWarning && !respondedOnTime) {
        log.info("User didn't response the inactivity warning within " + TimeUnit.MILLISECONDS.toSeconds(expiryTracker.userActivitySignResponseDelayInMs) + " seconds. Ejecting from meeting. meetingId=" + props.meetingProp.intId + " userId=" + u.intId + " user=" + u)

        UsersApp.ejectUserFromMeeting(
          outGW,
          liveMeeting,
          u.intId,
          SystemUser.ID,
          "User inactive for too long.",
          EjectReasonCode.USER_INACTIVITY,
          ban = false
        )

        // Force reconnection with graphql to refresh permissions
        for {
          regUser <- RegisteredUsers.findWithUserId(u.intId, liveMeeting.registeredUsers)
        } yield {
          Sender.sendForceUserGraphqlReconnectionSysMsg(liveMeeting.props.meetingProp.intId, regUser.id, regUser.sessionToken, EjectReasonCode.USER_INACTIVITY, outGW)
        }
      }
    }
  }

  def handleCheckRunningAndRecordingVoiceConfEvtMsg(msg: CheckRunningAndRecordingVoiceConfEvtMsg): Unit = {
    //msg.body.confRecordings foreach { cr =>
    //  println("rec = " + cr.recordPath)
    //}

    if (liveMeeting.props.recordProp.record &&
      msg.body.isRunning &&
      !msg.body.isRecording) {
      // Voice conference is running but not recording. We should start recording.
      // But first, see if we have recording streams and stop those.
      VoiceApp.stopRecordingVoiceConference(liveMeeting, outGW)
      // Remove recording streams that have stopped so we should only have
      // one active recording stream.

      // If the meeting is being actively recorded or recordFullDurationMedia is true
      // then we should start recording.
      if (MeetingStatus2x.isRecording(liveMeeting.status) ||
        liveMeeting.props.recordProp.recordFullDurationMedia) {
        val meetingId = liveMeeting.props.meetingProp.intId
        log.info("Forcing START RECORDING voice conf. meetingId=" + meetingId + " voice conf=" + liveMeeting.props.voiceProp.voiceConf)

        VoiceApp.startRecordingVoiceConference(liveMeeting, outGW)
      }
    }
  }

}
