package org.bigbluebutton.core.pubsub.senders

import org.apache.pekko.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.SystemConfiguration
import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.msgs.{ PluginDataChannelDeleteEntryMsgBody, _ }
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core2.ReceivedMessageRouter

import scala.reflect.runtime.universe._
import org.bigbluebutton.common2.bus.ReceivedJsonMessage
import org.bigbluebutton.common2.bus.IncomingJsonMessageBus

object ReceivedJsonMsgHandlerActor {
  def props(eventBus: BbbMsgRouterEventBus, incomingJsonMessageBus: IncomingJsonMessageBus): Props =
    Props(classOf[ReceivedJsonMsgHandlerActor], eventBus, incomingJsonMessageBus)
}

class ReceivedJsonMsgHandlerActor(
    val eventBus:               BbbMsgRouterEventBus,
    val incomingJsonMessageBus: IncomingJsonMessageBus
)
  extends Actor with ActorLogging
  with SystemConfiguration
  with ReceivedJsonMsgDeserializer
  with ReceivedMessageRouter {

  def receive = {
    case msg: ReceivedJsonMessage =>
      //      log.debug("handling {} - {}", msg.channel, msg.data)
      handleReceivedJsonMessage(msg)
    case _ => // do nothing
  }

  def handleReceivedJsonMessage(msg: ReceivedJsonMessage): Unit = {
    for {
      envJsonNode <- JsonDeserializer.toBbbCommonEnvJsNodeMsg(msg.data)
    } yield handle(envJsonNode.envelope, envJsonNode.core)
  }

  def route[T <: BbbCoreMsg](channel: String, envelope: BbbCoreEnvelope, jsonNode: JsonNode)(implicit tag: TypeTag[T]): Unit = {
    for {
      m <- deserialize[T](jsonNode)
    } yield {
      send(channel, envelope, m)
    }
  }

  def handle(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    // if (SendCursorPositionPubMsg.NAME != envelope.name)
    //   log.debug("Route envelope name " + envelope.name)

    envelope.name match {
      // System
      case CheckAlivePingSysMsg.NAME =>
        route[CheckAlivePingSysMsg](meetingManagerChannel, envelope, jsonNode)

      case CreateMeetingReqMsg.NAME =>
        route[CreateMeetingReqMsg](meetingManagerChannel, envelope, jsonNode)
      case RegisterUserReqMsg.NAME =>
        // Route via meeting manager as there is a race condition if we send directly to meeting
        // because the meeting actor might not have been created yet.
        route[RegisterUserReqMsg](meetingManagerChannel, envelope, jsonNode)
      case RegisterUserSessionTokenReqMsg.NAME =>
        route[RegisterUserSessionTokenReqMsg](meetingManagerChannel, envelope, jsonNode)
      case UserJoinMeetingReqMsg.NAME =>
        routeGenericMsg[UserJoinMeetingReqMsg](envelope, jsonNode)
      case DestroyMeetingSysCmdMsg.NAME =>
        route[DestroyMeetingSysCmdMsg](meetingManagerChannel, envelope, jsonNode)
      case EjectUserFromMeetingSysMsg.NAME =>
        routeGenericMsg[EjectUserFromMeetingSysMsg](envelope, jsonNode)

      // Guests
      case GetGuestsWaitingApprovalReqMsg.NAME =>
        routeGenericMsg[GetGuestsWaitingApprovalReqMsg](envelope, jsonNode)
      case GuestsWaitingApprovedMsg.NAME =>
        routeGenericMsg[GuestsWaitingApprovedMsg](envelope, jsonNode)
      case UpdatePositionInWaitingQueueReqMsg.NAME =>
        routeGenericMsg[UpdatePositionInWaitingQueueReqMsg](envelope, jsonNode)
      case SetGuestPolicyCmdMsg.NAME =>
        routeGenericMsg[SetGuestPolicyCmdMsg](envelope, jsonNode)
      case GetGuestPolicyReqMsg.NAME =>
        routeGenericMsg[GetGuestPolicyReqMsg](envelope, jsonNode)
      case SetGuestLobbyMessageCmdMsg.NAME =>
        routeGenericMsg[SetGuestLobbyMessageCmdMsg](envelope, jsonNode)
      case SetPrivateGuestLobbyMessageCmdMsg.NAME =>
        routeGenericMsg[SetPrivateGuestLobbyMessageCmdMsg](envelope, jsonNode)

      // Users
      case AddUserToPresenterGroupCmdMsg.NAME =>
        routeGenericMsg[AddUserToPresenterGroupCmdMsg](envelope, jsonNode)
      case RemoveUserFromPresenterGroupCmdMsg.NAME =>
        routeGenericMsg[RemoveUserFromPresenterGroupCmdMsg](envelope, jsonNode)
      case GetPresenterGroupReqMsg.NAME =>
        routeGenericMsg[GetPresenterGroupReqMsg](envelope, jsonNode)
      case UserActivitySignCmdMsg.NAME =>
        routeGenericMsg[UserActivitySignCmdMsg](envelope, jsonNode)
      case ChangeUserPinStateReqMsg.NAME =>
        routeGenericMsg[ChangeUserPinStateReqMsg](envelope, jsonNode)
      case UserConnectionAliveReqMsg.NAME =>
        routeGenericMsg[UserConnectionAliveReqMsg](envelope, jsonNode)
      case SetUserSpeechLocaleReqMsg.NAME =>
        routeGenericMsg[SetUserSpeechLocaleReqMsg](envelope, jsonNode)
      case SetUserCaptionLocaleReqMsg.NAME =>
        routeGenericMsg[SetUserCaptionLocaleReqMsg](envelope, jsonNode)
      case SetUserClientSettingsReqMsg.NAME =>
        routeGenericMsg[SetUserClientSettingsReqMsg](envelope, jsonNode)
      case SetUserEchoTestRunningReqMsg.NAME =>
        routeGenericMsg[SetUserEchoTestRunningReqMsg](envelope, jsonNode)
      case SetUserSpeechOptionsReqMsg.NAME =>
        routeGenericMsg[SetUserSpeechOptionsReqMsg](envelope, jsonNode)

      // Poll
      case StartCustomPollReqMsg.NAME =>
        routeGenericMsg[StartCustomPollReqMsg](envelope, jsonNode)
      case StartPollReqMsg.NAME =>
        routeGenericMsg[StartPollReqMsg](envelope, jsonNode)
      case StopPollReqMsg.NAME =>
        routeGenericMsg[StopPollReqMsg](envelope, jsonNode)
      case ShowPollResultReqMsg.NAME =>
        routeGenericMsg[ShowPollResultReqMsg](envelope, jsonNode)
      case GetCurrentPollReqMsg.NAME =>
        routeGenericMsg[GetCurrentPollReqMsg](envelope, jsonNode)
      case RespondToPollReqMsg.NAME =>
        routeGenericMsg[RespondToPollReqMsg](envelope, jsonNode)
      case RespondToTypedPollReqMsg.NAME =>
        routeGenericMsg[RespondToTypedPollReqMsg](envelope, jsonNode)

      // Webcam
      case UserBroadcastCamStartMsg.NAME =>
        routeGenericMsg[UserBroadcastCamStartMsg](envelope, jsonNode)
      case UserBroadcastCamStopMsg.NAME =>
        routeGenericMsg[UserBroadcastCamStopMsg](envelope, jsonNode)
      case GetCamBroadcastPermissionReqMsg.NAME =>
        routeGenericMsg[GetCamBroadcastPermissionReqMsg](envelope, jsonNode)
      case GetCamSubscribePermissionReqMsg.NAME =>
        routeGenericMsg[GetCamSubscribePermissionReqMsg](envelope, jsonNode)
      case CamStreamSubscribedInSfuEvtMsg.NAME =>
        routeGenericMsg[CamStreamSubscribedInSfuEvtMsg](envelope, jsonNode)
      case CamStreamUnsubscribedInSfuEvtMsg.NAME =>
        routeGenericMsg[CamStreamUnsubscribedInSfuEvtMsg](envelope, jsonNode)
      case CamBroadcastStoppedInSfuEvtMsg.NAME =>
        routeGenericMsg[CamBroadcastStoppedInSfuEvtMsg](envelope, jsonNode)
      case EjectUserCamerasCmdMsg.NAME =>
        routeGenericMsg[EjectUserCamerasCmdMsg](envelope, jsonNode)
      case GetWebcamsOnlyForModeratorReqMsg.NAME =>
        routeGenericMsg[GetWebcamsOnlyForModeratorReqMsg](envelope, jsonNode)
      case UpdateWebcamsOnlyForModeratorCmdMsg.NAME =>
        routeGenericMsg[UpdateWebcamsOnlyForModeratorCmdMsg](envelope, jsonNode)

      // Pads
      case PadGroupCreatedEvtMsg.NAME =>
        routePadMsg[PadGroupCreatedEvtMsg](envelope, jsonNode)
      case PadCreateReqMsg.NAME =>
        routeGenericMsg[PadCreateReqMsg](envelope, jsonNode)
      case PadCreatedEvtMsg.NAME =>
        routePadMsg[PadCreatedEvtMsg](envelope, jsonNode)
      case PadCreateSessionReqMsg.NAME =>
        routeGenericMsg[PadCreateSessionReqMsg](envelope, jsonNode)
      case PadSessionCreatedEvtMsg.NAME =>
        routePadMsg[PadSessionCreatedEvtMsg](envelope, jsonNode)
      case PadSessionDeletedSysMsg.NAME =>
        routePadMsg[PadSessionDeletedSysMsg](envelope, jsonNode)
      case PadUpdatedSysMsg.NAME =>
        routePadMsg[PadUpdatedSysMsg](envelope, jsonNode)
      case PadContentSysMsg.NAME =>
        routePadMsg[PadContentSysMsg](envelope, jsonNode)
      case PadPatchSysMsg.NAME =>
        routePadMsg[PadPatchSysMsg](envelope, jsonNode)
      case PadUpdatePubMsg.NAME =>
        routeGenericMsg[PadUpdatePubMsg](envelope, jsonNode)
      case PadPinnedReqMsg.NAME =>
        routeGenericMsg[PadPinnedReqMsg](envelope, jsonNode)

      // Voice
      case RecordingStartedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[RecordingStartedVoiceConfEvtMsg](envelope, jsonNode)
      case VoiceConfRunningEvtMsg.NAME =>
        routeVoiceMsg[VoiceConfRunningEvtMsg](envelope, jsonNode)
      case UserJoinedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[UserJoinedVoiceConfEvtMsg](envelope, jsonNode)
      case UserLeftVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[UserLeftVoiceConfEvtMsg](envelope, jsonNode)
      case UserMutedInVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[UserMutedInVoiceConfEvtMsg](envelope, jsonNode)
      case UserTalkingInVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[UserTalkingInVoiceConfEvtMsg](envelope, jsonNode)
      case MuteUserCmdMsg.NAME =>
        routeGenericMsg[MuteUserCmdMsg](envelope, jsonNode)
      case MuteAllExceptPresentersCmdMsg.NAME =>
        routeGenericMsg[MuteAllExceptPresentersCmdMsg](envelope, jsonNode)
      case EjectUserFromMeetingCmdMsg.NAME =>
        routeGenericMsg[EjectUserFromMeetingCmdMsg](envelope, jsonNode)
      case EjectUserFromVoiceCmdMsg.NAME =>
        routeGenericMsg[EjectUserFromVoiceCmdMsg](envelope, jsonNode)
      case UserConnectedToGlobalAudioMsg.NAME =>
        routeVoiceMsg[UserConnectedToGlobalAudioMsg](envelope, jsonNode)
      case UserDisconnectedFromGlobalAudioMsg.NAME =>
        routeVoiceMsg[UserDisconnectedFromGlobalAudioMsg](envelope, jsonNode)
      case MuteMeetingCmdMsg.NAME =>
        routeGenericMsg[MuteMeetingCmdMsg](envelope, jsonNode)
      case IsMeetingMutedReqMsg.NAME =>
        routeGenericMsg[IsMeetingMutedReqMsg](envelope, jsonNode)
      case AudioFloorChangedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[AudioFloorChangedVoiceConfEvtMsg](envelope, jsonNode)
      case CheckRunningAndRecordingVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[CheckRunningAndRecordingVoiceConfEvtMsg](envelope, jsonNode)
      case UserStatusVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[UserStatusVoiceConfEvtMsg](envelope, jsonNode)
      case VoiceConfCallStateEvtMsg.NAME =>
        routeVoiceMsg[VoiceConfCallStateEvtMsg](envelope, jsonNode)
      case GetGlobalAudioPermissionReqMsg.NAME =>
        routeGenericMsg[GetGlobalAudioPermissionReqMsg](envelope, jsonNode)
      case GetMicrophonePermissionReqMsg.NAME =>
        routeGenericMsg[GetMicrophonePermissionReqMsg](envelope, jsonNode)
      case ChannelHoldChangedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[ChannelHoldChangedVoiceConfEvtMsg](envelope, jsonNode)
      case ListenOnlyModeToggledInSfuEvtMsg.NAME =>
        routeVoiceMsg[ListenOnlyModeToggledInSfuEvtMsg](envelope, jsonNode)

      // Breakout rooms
      case BreakoutRoomsListMsg.NAME =>
        routeGenericMsg[BreakoutRoomsListMsg](envelope, jsonNode)
      case CreateBreakoutRoomsCmdMsg.NAME =>
        routeGenericMsg[CreateBreakoutRoomsCmdMsg](envelope, jsonNode)
      case RequestBreakoutJoinURLReqMsg.NAME =>
        routeGenericMsg[RequestBreakoutJoinURLReqMsg](envelope, jsonNode)
      case SetBreakoutRoomInviteDismissedReqMsg.NAME =>
        routeGenericMsg[SetBreakoutRoomInviteDismissedReqMsg](envelope, jsonNode)
      case EndAllBreakoutRoomsMsg.NAME =>
        routeGenericMsg[EndAllBreakoutRoomsMsg](envelope, jsonNode)
      case TransferUserToMeetingRequestMsg.NAME =>
        routeGenericMsg[TransferUserToMeetingRequestMsg](envelope, jsonNode)
      case UpdateBreakoutRoomsTimeReqMsg.NAME =>
        routeGenericMsg[UpdateBreakoutRoomsTimeReqMsg](envelope, jsonNode)
      case SendMessageToAllBreakoutRoomsReqMsg.NAME =>
        routeGenericMsg[SendMessageToAllBreakoutRoomsReqMsg](envelope, jsonNode)
      case ChangeUserBreakoutReqMsg.NAME =>
        routeGenericMsg[ChangeUserBreakoutReqMsg](envelope, jsonNode)

      // Layout
      case GetCurrentLayoutReqMsg.NAME =>
        routeGenericMsg[GetCurrentLayoutReqMsg](envelope, jsonNode)
      case BroadcastLayoutMsg.NAME =>
        routeGenericMsg[BroadcastLayoutMsg](envelope, jsonNode)
      case BroadcastPushLayoutMsg.NAME =>
        routeGenericMsg[BroadcastPushLayoutMsg](envelope, jsonNode)

      case UserLeaveReqMsg.NAME =>
        routeGenericMsg[UserLeaveReqMsg](envelope, jsonNode)
      case ChangeUserRaiseHandReqMsg.NAME =>
        routeGenericMsg[ChangeUserRaiseHandReqMsg](envelope, jsonNode)
      case ChangeUserAwayReqMsg.NAME =>
        routeGenericMsg[ChangeUserAwayReqMsg](envelope, jsonNode)
      case ChangeUserReactionEmojiReqMsg.NAME =>
        routeGenericMsg[ChangeUserReactionEmojiReqMsg](envelope, jsonNode)
      case ClearAllUsersReactionCmdMsg.NAME =>
        routeGenericMsg[ClearAllUsersReactionCmdMsg](envelope, jsonNode)
      case ChangeUserRoleCmdMsg.NAME =>
        routeGenericMsg[ChangeUserRoleCmdMsg](envelope, jsonNode)

      // Whiteboard
      case SendCursorPositionPubMsg.NAME =>
        routeGenericMsg[SendCursorPositionPubMsg](envelope, jsonNode)
      case ModifyWhiteboardAccessPubMsg.NAME =>
        routeGenericMsg[ModifyWhiteboardAccessPubMsg](envelope, jsonNode)
      case ClearWhiteboardPubMsg.NAME =>
        routeGenericMsg[ClearWhiteboardPubMsg](envelope, jsonNode)
      case DeleteWhiteboardAnnotationsPubMsg.NAME =>
        routeGenericMsg[DeleteWhiteboardAnnotationsPubMsg](envelope, jsonNode)
      case SendWhiteboardAnnotationsPubMsg.NAME =>
        routeGenericMsg[SendWhiteboardAnnotationsPubMsg](envelope, jsonNode)
      case GetWhiteboardAnnotationsReqMsg.NAME =>
        routeGenericMsg[GetWhiteboardAnnotationsReqMsg](envelope, jsonNode)
      case ClientToServerLatencyTracerMsg.NAME =>
        routeGenericMsg[ClientToServerLatencyTracerMsg](envelope, jsonNode)

      // Presentation
      case SetCurrentPresentationPubMsg.NAME =>
        routeGenericMsg[SetCurrentPresentationPubMsg](envelope, jsonNode)
      case SetCurrentPagePubMsg.NAME =>
        routeGenericMsg[SetCurrentPagePubMsg](envelope, jsonNode)
      case SetPageInfiniteWhiteboardPubMsg.NAME =>
        routeGenericMsg[SetPageInfiniteWhiteboardPubMsg](envelope, jsonNode)
      case ResizeAndMovePagePubMsg.NAME =>
        routeGenericMsg[ResizeAndMovePagePubMsg](envelope, jsonNode)
      case SlideResizedPubMsg.NAME =>
        routeGenericMsg[SlideResizedPubMsg](envelope, jsonNode)
      case RemovePresentationPubMsg.NAME =>
        routeGenericMsg[RemovePresentationPubMsg](envelope, jsonNode)
      case SetPresentationDownloadablePubMsg.NAME =>
        routeGenericMsg[SetPresentationDownloadablePubMsg](envelope, jsonNode)
      case PresentationUploadTokenReqMsg.NAME =>
        routeGenericMsg[PresentationUploadTokenReqMsg](envelope, jsonNode)
      case GetAllPresentationPodsReqMsg.NAME =>
        routeGenericMsg[GetAllPresentationPodsReqMsg](envelope, jsonNode)
      case PreuploadedPresentationsSysPubMsg.NAME =>
        routeGenericMsg[PreuploadedPresentationsSysPubMsg](envelope, jsonNode)
      case PresentationUploadedFileTooLargeErrorSysPubMsg.NAME =>
        routeGenericMsg[PresentationUploadedFileTooLargeErrorSysPubMsg](envelope, jsonNode)
      case PresentationHasInvalidMimeTypeErrorSysPubMsg.NAME =>
        routeGenericMsg[PresentationHasInvalidMimeTypeErrorSysPubMsg](envelope, jsonNode)
      case PresentationUploadedFileTimeoutErrorSysPubMsg.NAME =>
        routeGenericMsg[PresentationUploadedFileTimeoutErrorSysPubMsg](envelope, jsonNode)
      case PresentationConversionUpdateSysPubMsg.NAME =>
        routeGenericMsg[PresentationConversionUpdateSysPubMsg](envelope, jsonNode)
      case PresentationPageCountErrorSysPubMsg.NAME =>
        routeGenericMsg[PresentationPageCountErrorSysPubMsg](envelope, jsonNode)
      case PresentationPageGeneratedSysPubMsg.NAME =>
        routeGenericMsg[PresentationPageGeneratedSysPubMsg](envelope, jsonNode)
      case PresentationPageConvertedSysMsg.NAME =>
        routeGenericMsg[PresentationPageConvertedSysMsg](envelope, jsonNode)
      case PresentationPageConversionStartedSysMsg.NAME =>
        routeGenericMsg[PresentationPageConversionStartedSysMsg](envelope, jsonNode)
      case PresentationConversionEndedSysMsg.NAME =>
        routeGenericMsg[PresentationConversionEndedSysMsg](envelope, jsonNode)
      case PresentationConversionRequestReceivedSysMsg.NAME =>
        routeGenericMsg[PresentationConversionRequestReceivedSysMsg](envelope, jsonNode)
      case PresentationConversionCompletedSysPubMsg.NAME =>
        routeGenericMsg[PresentationConversionCompletedSysPubMsg](envelope, jsonNode)
      case PdfConversionInvalidErrorSysPubMsg.NAME =>
        routeGenericMsg[PdfConversionInvalidErrorSysPubMsg](envelope, jsonNode)
      case AssignPresenterReqMsg.NAME =>
        routeGenericMsg[AssignPresenterReqMsg](envelope, jsonNode)
      case MakePresentationDownloadReqMsg.NAME =>
        routeGenericMsg[MakePresentationDownloadReqMsg](envelope, jsonNode)
      case NewPresFileAvailableMsg.NAME =>
        routeGenericMsg[NewPresFileAvailableMsg](envelope, jsonNode)
      case PresAnnStatusMsg.NAME =>
        routeGenericMsg[PresAnnStatusMsg](envelope, jsonNode)

      // Presentation Pods
      case CreateNewPresentationPodPubMsg.NAME =>
        routeGenericMsg[CreateNewPresentationPodPubMsg](envelope, jsonNode)
      case RemovePresentationPodPubMsg.NAME =>
        routeGenericMsg[RemovePresentationPodPubMsg](envelope, jsonNode)

      // Caption
      case EditCaptionHistoryPubMsg.NAME =>
        routeGenericMsg[EditCaptionHistoryPubMsg](envelope, jsonNode)
      case AddCaptionLocalePubMsg.NAME =>
        routeGenericMsg[AddCaptionLocalePubMsg](envelope, jsonNode)
      case SendCaptionHistoryReqMsg.NAME =>
        routeGenericMsg[SendCaptionHistoryReqMsg](envelope, jsonNode)
      case CaptionSubmitTranscriptPubMsg.NAME =>
        routeGenericMsg[CaptionSubmitTranscriptPubMsg](envelope, jsonNode)

      // Chat
      case GetChatHistoryReqMsg.NAME =>
        routeGenericMsg[GetChatHistoryReqMsg](envelope, jsonNode)
      case SendPublicMessagePubMsg.NAME =>
        routeGenericMsg[SendPublicMessagePubMsg](envelope, jsonNode)
      case SendPrivateMessagePubMsg.NAME =>
        routeGenericMsg[SendPrivateMessagePubMsg](envelope, jsonNode)
      case ClearPublicChatHistoryPubMsg.NAME =>
        routeGenericMsg[ClearPublicChatHistoryPubMsg](envelope, jsonNode)
      case UserTypingPubMsg.NAME =>
        routeGenericMsg[UserTypingPubMsg](envelope, jsonNode)

      // Meeting
      case EndMeetingSysCmdMsg.NAME =>
        routeGenericMsg[EndMeetingSysCmdMsg](envelope, jsonNode)
      case LogoutAndEndMeetingCmdMsg.NAME =>
        routeGenericMsg[LogoutAndEndMeetingCmdMsg](envelope, jsonNode)
      case SetRecordingStatusCmdMsg.NAME =>
        routeGenericMsg[SetRecordingStatusCmdMsg](envelope, jsonNode)
      case RecordAndClearPreviousMarkersCmdMsg.NAME =>
        routeGenericMsg[RecordAndClearPreviousMarkersCmdMsg](envelope, jsonNode)
      case GetRecordingStatusReqMsg.NAME =>
        routeGenericMsg[GetRecordingStatusReqMsg](envelope, jsonNode)
      case GetScreenshareStatusReqMsg.NAME =>
        routeGenericMsg[GetScreenshareStatusReqMsg](envelope, jsonNode)

      // Lock settings
      case LockUserInMeetingCmdMsg.NAME =>
        routeGenericMsg[LockUserInMeetingCmdMsg](envelope, jsonNode)
      case ChangeUserLockSettingsInMeetingCmdMsg.NAME =>
        routeGenericMsg[ChangeUserLockSettingsInMeetingCmdMsg](envelope, jsonNode)
      case ChangeLockSettingsInMeetingCmdMsg.NAME =>
        routeGenericMsg[ChangeLockSettingsInMeetingCmdMsg](envelope, jsonNode)
      case LockUsersInMeetingCmdMsg.NAME =>
        routeGenericMsg[LockUsersInMeetingCmdMsg](envelope, jsonNode)

      // Screenshare
      case ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg](envelope, jsonNode)
      case ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg](envelope, jsonNode)
      case GetScreenBroadcastPermissionReqMsg.NAME =>
        routeGenericMsg[GetScreenBroadcastPermissionReqMsg](envelope, jsonNode)
      case GetScreenSubscribePermissionReqMsg.NAME =>
        routeGenericMsg[GetScreenSubscribePermissionReqMsg](envelope, jsonNode)

      // AudioCaptions
      case UpdateTranscriptPubMsg.NAME =>
        routeGenericMsg[UpdateTranscriptPubMsg](envelope, jsonNode)
      case TranscriptionProviderErrorMsg.NAME =>
        routeGenericMsg[TranscriptionProviderErrorMsg](envelope, jsonNode)

      // GroupChats
      case GetGroupChatsReqMsg.NAME =>
        routeGenericMsg[GetGroupChatsReqMsg](envelope, jsonNode)
      case SendGroupChatMessageMsg.NAME =>
        routeGenericMsg[SendGroupChatMessageMsg](envelope, jsonNode)
      case SendGroupChatMessageFromApiSysPubMsg.NAME =>
        routeGenericMsg[SendGroupChatMessageFromApiSysPubMsg](envelope, jsonNode)
      case GetGroupChatMsgsReqMsg.NAME =>
        routeGenericMsg[GetGroupChatMsgsReqMsg](envelope, jsonNode)
      case CreateGroupChatReqMsg.NAME =>
        routeGenericMsg[CreateGroupChatReqMsg](envelope, jsonNode)
      case SetGroupChatLastSeenReqMsg.NAME =>
        routeGenericMsg[SetGroupChatLastSeenReqMsg](envelope, jsonNode)
      case SetGroupChatVisibleReqMsg.NAME =>
        routeGenericMsg[SetGroupChatVisibleReqMsg](envelope, jsonNode)

      //Plugin
      case PluginDataChannelPushEntryMsg.NAME =>
        routeGenericMsg[PluginDataChannelPushEntryMsg](envelope, jsonNode)

      case PluginDataChannelReplaceEntryMsg.NAME =>
        routeGenericMsg[PluginDataChannelReplaceEntryMsg](envelope, jsonNode)

      case PluginDataChannelDeleteEntryMsg.NAME =>
        routeGenericMsg[PluginDataChannelDeleteEntryMsg](envelope, jsonNode)

      case PluginDataChannelResetMsg.NAME =>
        routeGenericMsg[PluginDataChannelResetMsg](envelope, jsonNode)

      case PluginLearningAnalyticsDashboardSendGenericDataMsg.NAME =>
        routeGenericMsg[PluginLearningAnalyticsDashboardSendGenericDataMsg](envelope, jsonNode)

      // ExternalVideo
      case StartExternalVideoPubMsg.NAME =>
        routeGenericMsg[StartExternalVideoPubMsg](envelope, jsonNode)
      case UpdateExternalVideoPubMsg.NAME =>
        routeGenericMsg[UpdateExternalVideoPubMsg](envelope, jsonNode)
      case StopExternalVideoPubMsg.NAME =>
        routeGenericMsg[StopExternalVideoPubMsg](envelope, jsonNode)

      // Timer
      case ActivateTimerReqMsg.NAME =>
        routeGenericMsg[ActivateTimerReqMsg](envelope, jsonNode)
      case DeactivateTimerReqMsg.NAME =>
        routeGenericMsg[DeactivateTimerReqMsg](envelope, jsonNode)
      case StartTimerReqMsg.NAME =>
        routeGenericMsg[StartTimerReqMsg](envelope, jsonNode)
      case StopTimerReqMsg.NAME =>
        routeGenericMsg[StopTimerReqMsg](envelope, jsonNode)
      case SwitchTimerReqMsg.NAME =>
        routeGenericMsg[SwitchTimerReqMsg](envelope, jsonNode)
      case SetTimerReqMsg.NAME =>
        routeGenericMsg[SetTimerReqMsg](envelope, jsonNode)
      case ResetTimerReqMsg.NAME =>
        routeGenericMsg[ResetTimerReqMsg](envelope, jsonNode)
      case SetTrackReqMsg.NAME =>
        routeGenericMsg[SetTrackReqMsg](envelope, jsonNode)

      // Messages from Graphql Middleware
      case UserGraphqlConnectionEstablishedSysMsg.NAME =>
        route[UserGraphqlConnectionEstablishedSysMsg](meetingManagerChannel, envelope, jsonNode)

      case UserGraphqlConnectionClosedSysMsg.NAME =>
        route[UserGraphqlConnectionClosedSysMsg](meetingManagerChannel, envelope, jsonNode)

      case CheckGraphqlMiddlewareAlivePongSysMsg.NAME =>
        route[CheckGraphqlMiddlewareAlivePongSysMsg](meetingManagerChannel, envelope, jsonNode)

      case _ =>
        log.debug("Cannot route envelope name " + envelope.name)
      // do nothing
    }
  }

}
