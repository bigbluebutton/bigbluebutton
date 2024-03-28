package org.bigbluebutton.core2

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.util.JsonUtil
object AnalyticsActor {
  def props(includeChat: Boolean): Props = Props(classOf[AnalyticsActor], includeChat)
}

class AnalyticsActor(val includeChat: Boolean) extends Actor with ActorLogging {

  val TAG = "-- analytics -- "

  def receive = {
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)
    case _                        => log.warning("Cannot handle message ")
  }

  def logMessage(msg: BbbCommonEnvCoreMsg): Unit = {
    val json = JsonUtil.toJson(msg)
    log.info(TAG + json)
  }

  def logChatMessage(msg: BbbCommonEnvCoreMsg): Unit = {
    if (includeChat) {
      logMessage(msg)
    }
  }

  def traceMessage(msg: BbbCommonEnvCoreMsg): Unit = {
    val json = JsonUtil.toJson(msg)
    log.info(" -- trace -- " + json)
  }

  def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {

    msg.core match {
      case m: GetAllMeetingsReqMsg                           => logMessage(msg)
      case m: GetRunningMeetingsRespMsg                      => logMessage(msg)
      case m: GetRunningMeetingsReqMsg                       => logMessage(msg)

      case m: RegisterUserReqMsg                             => logMessage(msg)
      case m: UserRegisteredRespMsg                          => logMessage(msg)
      case m: DisconnectAllClientsSysMsg                     => logMessage(msg)
      case m: DisconnectClientSysMsg                         => logMessage(msg)
      case m: MeetingEndingEvtMsg                            => logMessage(msg)
      case m: MeetingCreatedEvtMsg                           => logMessage(msg)
      case m: LogoutAndEndMeetingCmdMsg                      => logMessage(msg)
      case m: ValidateAuthTokenRespMsg                       => logMessage(msg)
      case m: UserJoinedMeetingEvtMsg                        => logMessage(msg)
      case m: RecordingStatusChangedEvtMsg                   => logMessage(msg)
      case m: WebcamsOnlyForModeratorChangedEvtMsg           => logMessage(msg)
      case m: UserLeftMeetingEvtMsg                          => logMessage(msg)
      case m: PresenterUnassignedEvtMsg                      => logMessage(msg)
      case m: PresenterAssignedEvtMsg                        => logMessage(msg)
      case m: EjectUserFromVoiceConfSysMsg                   => logMessage(msg)
      case m: CreateBreakoutRoomSysCmdMsg                    => logMessage(msg)
      case m: RequestBreakoutJoinURLReqMsg                   => logMessage(msg)
      case m: EndAllBreakoutRoomsMsg                         => logMessage(msg)
      case m: TransferUserToMeetingRequestMsg                => logMessage(msg)
      case m: UpdateBreakoutRoomsTimeReqMsg                  => logMessage(msg)
      case m: SendMessageToAllBreakoutRoomsReqMsg            => logMessage(msg)
      case m: UserLeftVoiceConfToClientEvtMsg                => logMessage(msg)
      case m: UserLeftVoiceConfEvtMsg                        => logMessage(msg)
      case m: RecordingStartedVoiceConfEvtMsg                => logMessage(msg)
      case m: MuteUserCmdMsg                                 => logMessage(msg)
      case m: MuteUserInVoiceConfSysMsg                      => logMessage(msg)
      case m: DeafUserInVoiceConfSysMsg                      => logMessage(msg)
      case m: HoldUserInVoiceConfSysMsg                      => logMessage(msg)
      case m: PlaySoundInVoiceConfSysMsg                     => logMessage(msg)
      case m: StopSoundInVoiceConfSysMsg                     => logMessage(msg)
      case m: MuteAllExceptPresentersCmdMsg                  => logMessage(msg)
      case m: EjectUserFromVoiceCmdMsg                       => logMessage(msg)
      case m: MuteMeetingCmdMsg                              => logMessage(msg)
      case m: UserConnectedToGlobalAudioMsg                  => logMessage(msg)
      case m: UserJoinedVoiceConfToClientEvtMsg              => logMessage(msg)
      case m: UserDisconnectedFromGlobalAudioMsg             => logMessage(msg)
      case m: AssignPresenterReqMsg                          => logMessage(msg)
      case m: ChangeUserPinStateReqMsg                       => logMessage(msg)
      case m: ChangeUserMobileFlagReqMsg                     => logMessage(msg)
      case m: ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg => logMessage(msg)
      case m: ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg => logMessage(msg)
      case m: ScreenshareRtmpBroadcastStartedEvtMsg          => logMessage(msg)
      case m: ScreenshareRtmpBroadcastStoppedEvtMsg          => logMessage(msg)
      case m: StartRecordingVoiceConfSysMsg                  => logMessage(msg)
      case m: StopRecordingVoiceConfSysMsg                   => logMessage(msg)
      //case m: UpdateRecordingTimerEvtMsg => logMessage(msg)
      case m: RecordAndClearPreviousMarkersCmdMsg            => logMessage(msg)
      case m: TransferUserToVoiceConfSysMsg                  => logMessage(msg)
      case m: UserBroadcastCamStartMsg                       => logMessage(msg)
      case m: UserBroadcastCamStopMsg                        => logMessage(msg)
      case m: UserBroadcastCamStoppedEvtMsg                  => logMessage(msg)
      case m: UserBroadcastCamStartedEvtMsg                  => logMessage(msg)
      case m: EjectUserFromMeetingSysMsg                     => logMessage(msg)
      case m: UserActivitySignCmdMsg                         => logMessage(msg)
      case m: UserInactivityInspectMsg                       => logMessage(msg)

      case m: ChangeUserRoleCmdMsg                           => logMessage(msg)

      // Voice
      case m: UserMutedVoiceEvtMsg =>
        logMessage(msg)
      case m: VoiceConfCallStateEvtMsg => logMessage(msg)
      case m: VoiceCallStateEvtMsg => logMessage(msg)
      case m: HoldChannelInVoiceConfSysMsg => logMessage(msg)
      case m: ChannelHoldChangedVoiceConfEvtMsg => logMessage(msg)
      case m: ToggleListenOnlyModeSysMsg => logMessage(msg)
      case m: ListenOnlyModeToggledInSfuEvtMsg => logMessage(msg)

      // Breakout
      case m: BreakoutRoomEndedEvtMsg => logMessage(msg)

      // Presentation
      //case m: PresentationConversionCompletedSysPubMsg => logMessage(msg)
      case m: PdfConversionInvalidErrorSysPubMsg => logMessage(msg)
      case m: SetCurrentPresentationPubMsg => logMessage(msg)
      case m: SetCurrentPresentationEvtMsg => logMessage(msg)
      case m: SetPresentationDownloadablePubMsg => logMessage(msg)
      case m: SetPresentationDownloadableEvtMsg => logMessage(msg)
      //case m: PresentationPageConvertedSysMsg => logMessage(msg)
      //case m: PresentationPageConvertedEventMsg => logMessage(msg)
      // case m: StoreAnnotationsInRedisSysMsg => logMessage(msg)
      // case m: StoreExportJobInRedisSysMsg => logMessage(msg)
      case m: MakePresentationDownloadReqMsg => logMessage(msg)
      case m: NewPresFileAvailableMsg => logMessage(msg)
      case m: PresentationPageConversionStartedSysMsg => logMessage(msg)
      case m: PresentationConversionEndedSysMsg => logMessage(msg)
      case m: PresentationConversionRequestReceivedSysMsg => logMessage(msg)
      //case m: PresentationConversionCompletedEvtMsg => logMessage(msg)
      case m: GetAllPresentationPodsReqMsg => logMessage(msg)
      //case m: PresentationPageGeneratedSysPubMsg => logMessage(msg)
      //case m: PresentationPageGeneratedEvtMsg => logMessage(msg)
      //case m: ResizeAndMovePagePubMsg => logMessage(msg)
      case m: PresentationConversionUpdateSysPubMsg => logMessage(msg)
      case m: PresentationConversionUpdateEvtMsgBody => logMessage(msg)
      case m: PresentationPageCountErrorSysPubMsg => logMessage(msg)
      case m: PresentationPageCountErrorEvtMsg => logMessage(msg)
      case m: PresentationUploadedFileTooLargeErrorSysPubMsg => logMessage(msg)
      case m: PresentationUploadedFileTooLargeErrorEvtMsg => logMessage(msg)

      // Group Chats
      case m: SendGroupChatMessageMsg => logChatMessage(msg)
      case m: GroupChatMessageBroadcastEvtMsg => logChatMessage(msg)
      case m: GetGroupChatMsgsReqMsg => logChatMessage(msg)
      case m: GetGroupChatMsgsRespMsg => logChatMessage(msg)
      case m: CreateGroupChatReqMsg => logChatMessage(msg)
      case m: GroupChatCreatedEvtMsg => logChatMessage(msg)
      case m: GetGroupChatsReqMsg => logChatMessage(msg)
      case m: GetGroupChatsRespMsg => logChatMessage(msg)

      // Guest Management
      case m: GuestsWaitingApprovedMsg => logMessage(msg)
      case m: GuestsWaitingApprovedEvtMsg => logMessage(msg)
      case m: GuestWaitingLeftMsg => logMessage(msg)
      case m: GuestWaitingLeftEvtMsg => logMessage(msg)
      case m: GuestsWaitingForApprovalEvtMsg => logMessage(msg)
      case m: UpdatePositionInWaitingQueueReqMsg => logMessage(msg)
      case m: PosInWaitingQueueUpdatedRespMsg => logMessage(msg)
      case m: SetGuestPolicyCmdMsg => logMessage(msg)
      case m: GuestPolicyChangedEvtMsg => logMessage(msg)
      case m: SetGuestLobbyMessageCmdMsg => logMessage(msg)
      case m: GuestLobbyMessageChangedEvtMsg => logMessage(msg)
      case m: SetPrivateGuestLobbyMessageCmdMsg => logMessage(msg)
      case m: PrivateGuestLobbyMsgChangedEvtMsg => logMessage(msg)

      // System
      case m: ClientToServerLatencyTracerMsg => traceMessage(msg)
      case m: ServerToClientLatencyTracerMsg => traceMessage(msg)
      case m: ValidateConnAuthTokenSysMsg => traceMessage(msg)
      case m: ValidateConnAuthTokenSysRespMsg => traceMessage(msg)

      // Recording
      case m: RecordingChapterBreakSysMsg => logMessage(msg)
      case m: VoiceRecordingStartedEvtMsg => logMessage(msg)
      case m: VoiceRecordingStoppedEvtMsgBody => logMessage(msg)
      //case m: CheckRunningAndRecordingToVoiceConfSysMsg => logMessage(msg)
      //case m: CheckRunningAndRecordingVoiceConfEvtMsg => logMessage(msg)

      case m: GetLockSettingsRespMsg => logMessage(msg)
      case m: ChangeLockSettingsInMeetingCmdMsg => logMessage(msg)
      case m: GetLockSettingsReqMsg => logMessage(msg)
      case m: LockSettingsNotInitializedRespMsg => logMessage(msg)
      case m: MeetingInfoAnalyticsMsg => logMessage(msg)

      // Layout
      case m: BroadcastLayoutMsg => logMessage(msg)
      case m: BroadcastLayoutEvtMsg => logMessage(msg)

      // Pads
      case m: PadCreateGroupReqMsg => logMessage(msg)
      case m: PadCreateGroupCmdMsg => logMessage(msg)
      case m: PadGroupCreatedEvtMsg => logMessage(msg)
      case m: PadGroupCreatedRespMsg => logMessage(msg)
      case m: PadCreateReqMsg => logMessage(msg)
      case m: PadCreateCmdMsg => logMessage(msg)
      case m: PadCreatedEvtMsg => logMessage(msg)
      case m: PadCreatedRespMsg => logMessage(msg)
      case m: PadCreateSessionReqMsg => logMessage(msg)
      case m: PadCreateSessionCmdMsg => logMessage(msg)
      case m: PadSessionCreatedEvtMsg => logMessage(msg)
      case m: PadSessionCreatedRespMsg => logMessage(msg)
      case m: PadSessionDeletedSysMsg => logMessage(msg)
      case m: PadSessionDeletedEvtMsg => logMessage(msg)
      case m: PadUpdatedSysMsg => logMessage(msg)
      case m: PadUpdatedEvtMsg => logMessage(msg)
      case m: PadUpdatePubMsg => logMessage(msg)
      case m: PadUpdateCmdMsg => logMessage(msg)
      case m: PadCapturePubMsg => logMessage(msg)

      case m: EndMeetingPromptReqMsg => logMessage(msg)

      case _ => // ignore message
    }
  }
}
