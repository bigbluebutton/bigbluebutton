package org.bigbluebutton.core.pubsub.senders

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.SystemConfiguration
import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core2.ReceivedMessageRouter
import scala.reflect.runtime.universe._

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
      case ValidateAuthTokenReqMsg.NAME =>
        routeGenericMsg[ValidateAuthTokenReqMsg](envelope, jsonNode)
      case RegisterUserReqMsg.NAME =>
        // Route via meeting manager as there is a race condition if we send directly to meeting
        // because the meeting actor might not have been created yet.
        route[RegisterUserReqMsg](meetingManagerChannel, envelope, jsonNode)
      case UserJoinMeetingReqMsg.NAME =>
        routeGenericMsg[UserJoinMeetingReqMsg](envelope, jsonNode)
      case UserJoinMeetingAfterReconnectReqMsg.NAME =>
        routeGenericMsg[UserJoinMeetingAfterReconnectReqMsg](envelope, jsonNode)
      case GetAllMeetingsReqMsg.NAME =>
        route[GetAllMeetingsReqMsg](meetingManagerChannel, envelope, jsonNode)
      case DestroyMeetingSysCmdMsg.NAME =>
        route[DestroyMeetingSysCmdMsg](meetingManagerChannel, envelope, jsonNode)
      case ValidateConnAuthTokenSysMsg.NAME =>
        route[ValidateConnAuthTokenSysMsg](meetingManagerChannel, envelope, jsonNode)

      // Guests
      case GetGuestsWaitingApprovalReqMsg.NAME =>
        routeGenericMsg[GetGuestsWaitingApprovalReqMsg](envelope, jsonNode)
      case GuestsWaitingApprovedMsg.NAME =>
        routeGenericMsg[GuestsWaitingApprovedMsg](envelope, jsonNode)
      case SetGuestPolicyCmdMsg.NAME =>
        routeGenericMsg[SetGuestPolicyCmdMsg](envelope, jsonNode)
      case GetGuestPolicyReqMsg.NAME =>
        routeGenericMsg[GetGuestPolicyReqMsg](envelope, jsonNode)

      // Users
      case GetUsersMeetingReqMsg.NAME =>
        routeGenericMsg[GetUsersMeetingReqMsg](envelope, jsonNode)
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

      // Webcam
      case UserBroadcastCamStartMsg.NAME =>
        routeGenericMsg[UserBroadcastCamStartMsg](envelope, jsonNode)
      case UserBroadcastCamStopMsg.NAME =>
        routeGenericMsg[UserBroadcastCamStopMsg](envelope, jsonNode)

      // Voice
      case RecordingStartedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[RecordingStartedVoiceConfEvtMsg](envelope, jsonNode)
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

      // Breakout rooms
      case BreakoutRoomsListMsg.NAME =>
        routeGenericMsg[BreakoutRoomsListMsg](envelope, jsonNode)
      case CreateBreakoutRoomsCmdMsg.NAME =>
        routeGenericMsg[CreateBreakoutRoomsCmdMsg](envelope, jsonNode)
      case RequestBreakoutJoinURLReqMsg.NAME =>
        routeGenericMsg[RequestBreakoutJoinURLReqMsg](envelope, jsonNode)
      case EndAllBreakoutRoomsMsg.NAME =>
        routeGenericMsg[EndAllBreakoutRoomsMsg](envelope, jsonNode)
      case TransferUserToMeetingRequestMsg.NAME =>
        routeGenericMsg[TransferUserToMeetingRequestMsg](envelope, jsonNode)

      // Layout
      case GetCurrentLayoutReqMsg.NAME =>
        routeGenericMsg[GetCurrentLayoutReqMsg](envelope, jsonNode)
      case BroadcastLayoutMsg.NAME =>
        routeGenericMsg[BroadcastLayoutMsg](envelope, jsonNode)

      case UserLeaveReqMsg.NAME =>
        routeGenericMsg[UserLeaveReqMsg](envelope, jsonNode)
      case ChangeUserEmojiCmdMsg.NAME =>
        routeGenericMsg[ChangeUserEmojiCmdMsg](envelope, jsonNode)
      case ChangeUserRoleCmdMsg.NAME =>
        routeGenericMsg[ChangeUserRoleCmdMsg](envelope, jsonNode)

      // Whiteboard
      case SendCursorPositionPubMsg.NAME =>
        routeGenericMsg[SendCursorPositionPubMsg](envelope, jsonNode)
      case ModifyWhiteboardAccessPubMsg.NAME =>
        routeGenericMsg[ModifyWhiteboardAccessPubMsg](envelope, jsonNode)
      case GetWhiteboardAccessReqMsg.NAME =>
        routeGenericMsg[GetWhiteboardAccessReqMsg](envelope, jsonNode)
      case ClearWhiteboardPubMsg.NAME =>
        routeGenericMsg[ClearWhiteboardPubMsg](envelope, jsonNode)
      case UndoWhiteboardPubMsg.NAME =>
        routeGenericMsg[UndoWhiteboardPubMsg](envelope, jsonNode)
      case SendWhiteboardAnnotationPubMsg.NAME =>
        routeGenericMsg[SendWhiteboardAnnotationPubMsg](envelope, jsonNode)
      case GetWhiteboardAnnotationsReqMsg.NAME =>
        routeGenericMsg[GetWhiteboardAnnotationsReqMsg](envelope, jsonNode)
      case ClientToServerLatencyTracerMsg.NAME =>
        routeGenericMsg[ClientToServerLatencyTracerMsg](envelope, jsonNode)

      // Presentation
      case SetCurrentPresentationPubMsg.NAME =>
        routeGenericMsg[SetCurrentPresentationPubMsg](envelope, jsonNode)
      case GetPresentationInfoReqMsg.NAME =>
        routeGenericMsg[GetPresentationInfoReqMsg](envelope, jsonNode)
      case SetCurrentPagePubMsg.NAME =>
        routeGenericMsg[SetCurrentPagePubMsg](envelope, jsonNode)
      case ResizeAndMovePagePubMsg.NAME =>
        routeGenericMsg[ResizeAndMovePagePubMsg](envelope, jsonNode)
      case RemovePresentationPubMsg.NAME =>
        routeGenericMsg[RemovePresentationPubMsg](envelope, jsonNode)
      case PreuploadedPresentationsSysPubMsg.NAME =>
        routeGenericMsg[PreuploadedPresentationsSysPubMsg](envelope, jsonNode)
      case PresentationConversionUpdateSysPubMsg.NAME =>
        routeGenericMsg[PresentationConversionUpdateSysPubMsg](envelope, jsonNode)
      case PresentationPageCountErrorSysPubMsg.NAME =>
        routeGenericMsg[PresentationPageCountErrorSysPubMsg](envelope, jsonNode)
      case PresentationPageGeneratedSysPubMsg.NAME =>
        routeGenericMsg[PresentationPageGeneratedSysPubMsg](envelope, jsonNode)
      case PresentationConversionCompletedSysPubMsg.NAME =>
        routeGenericMsg[PresentationConversionCompletedSysPubMsg](envelope, jsonNode)
      case AssignPresenterReqMsg.NAME =>
        routeGenericMsg[AssignPresenterReqMsg](envelope, jsonNode)

      // Caption
      case EditCaptionHistoryPubMsg.NAME =>
        routeGenericMsg[EditCaptionHistoryPubMsg](envelope, jsonNode)
      case UpdateCaptionOwnerPubMsg.NAME =>
        routeGenericMsg[UpdateCaptionOwnerPubMsg](envelope, jsonNode)
      case SendCaptionHistoryReqMsg.NAME =>
        routeGenericMsg[SendCaptionHistoryReqMsg](envelope, jsonNode)

      // Shared notes
      case GetSharedNotesPubMsg.NAME =>
        routeGenericMsg[GetSharedNotesPubMsg](envelope, jsonNode)
      case SyncSharedNotePubMsg.NAME =>
        routeGenericMsg[SyncSharedNotePubMsg](envelope, jsonNode)
      case ClearSharedNotePubMsg.NAME =>
        routeGenericMsg[ClearSharedNotePubMsg](envelope, jsonNode)
      case UpdateSharedNoteReqMsg.NAME =>
        routeGenericMsg[UpdateSharedNoteReqMsg](envelope, jsonNode)
      case CreateSharedNoteReqMsg.NAME =>
        routeGenericMsg[CreateSharedNoteReqMsg](envelope, jsonNode)
      case DestroySharedNoteReqMsg.NAME =>
        routeGenericMsg[DestroySharedNoteReqMsg](envelope, jsonNode)

      // Chat
      case GetChatHistoryReqMsg.NAME =>
        routeGenericMsg[GetChatHistoryReqMsg](envelope, jsonNode)
      case SendPublicMessagePubMsg.NAME =>
        routeGenericMsg[SendPublicMessagePubMsg](envelope, jsonNode)
      case SendPrivateMessagePubMsg.NAME =>
        routeGenericMsg[SendPrivateMessagePubMsg](envelope, jsonNode)
      case ClearPublicChatHistoryPubMsg.NAME =>
        routeGenericMsg[ClearPublicChatHistoryPubMsg](envelope, jsonNode)

      // Meeting
      case EndMeetingSysCmdMsg.NAME =>
        routeGenericMsg[EndMeetingSysCmdMsg](envelope, jsonNode)
      case MeetingActivityResponseCmdMsg.NAME =>
        routeGenericMsg[MeetingActivityResponseCmdMsg](envelope, jsonNode)
      case LogoutAndEndMeetingCmdMsg.NAME =>
        routeGenericMsg[LogoutAndEndMeetingCmdMsg](envelope, jsonNode)
      case SetRecordingStatusCmdMsg.NAME =>
        routeGenericMsg[SetRecordingStatusCmdMsg](envelope, jsonNode)
      case GetRecordingStatusReqMsg.NAME =>
        routeGenericMsg[GetRecordingStatusReqMsg](envelope, jsonNode)
      case GetScreenshareStatusReqMsg.NAME =>
        routeGenericMsg[GetScreenshareStatusReqMsg](envelope, jsonNode)
      case GetWebcamsOnlyForModeratorReqMsg.NAME =>
        routeGenericMsg[GetWebcamsOnlyForModeratorReqMsg](envelope, jsonNode)
      case UpdateWebcamsOnlyForModeratorCmdMsg.NAME =>
        routeGenericMsg[UpdateWebcamsOnlyForModeratorCmdMsg](envelope, jsonNode)

      // Lock settings
      case LockUserInMeetingCmdMsg.NAME =>
        routeGenericMsg[LockUserInMeetingCmdMsg](envelope, jsonNode)
      case ChangeLockSettingsInMeetingCmdMsg.NAME =>
        routeGenericMsg[ChangeLockSettingsInMeetingCmdMsg](envelope, jsonNode)
      case LockUsersInMeetingCmdMsg.NAME =>
        routeGenericMsg[LockUsersInMeetingCmdMsg](envelope, jsonNode)
      case GetLockSettingsReqMsg.NAME =>
        routeGenericMsg[GetLockSettingsReqMsg](envelope, jsonNode)

      // Screenshare
      case ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg](envelope, jsonNode)
      case ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg](envelope, jsonNode)
      case ScreenshareStartedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[ScreenshareStartedVoiceConfEvtMsg](envelope, jsonNode)
      case ScreenshareStoppedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[ScreenshareStoppedVoiceConfEvtMsg](envelope, jsonNode)

      case _ =>
        log.error("Cannot route envelope name " + envelope.name)
      // do nothing
    }
  }

}
