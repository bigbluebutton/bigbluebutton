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
  val eventBus: BbbMsgRouterEventBus,
  val incomingJsonMessageBus: IncomingJsonMessageBus)
    extends Actor with ActorLogging
    with SystemConfiguration
    with ReceivedJsonMsgDeserializer
    with ReceivedMessageRouter {

  def receive = {
    case msg: ReceivedJsonMessage =>
      //log.debug("handling {} - {}", msg.channel, msg.data)
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
      case CreateMeetingReqMsg.NAME =>
        route[CreateMeetingReqMsg](meetingManagerChannel, envelope, jsonNode)
      case ValidateAuthTokenReqMsg.NAME =>
        for {
          m <- deserialize[ValidateAuthTokenReqMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case RegisterUserReqMsg.NAME =>
        // Route via meeting manager as there is a race condition if we send directly to meeting
        // because the meeting actor might not have been created yet.
        route[RegisterUserReqMsg](meetingManagerChannel, envelope, jsonNode)
      case UserJoinMeetingReqMsg.NAME =>
        for {
          m <- deserialize[UserJoinMeetingReqMsg](jsonNode)
        } yield {
          send(m.header.userId, envelope, m)
        }
      case GetAllMeetingsReqMsg.NAME =>
        route[GetAllMeetingsReqMsg](meetingManagerChannel, envelope, jsonNode)
      case DestroyMeetingSysCmdMsg.NAME =>
        route[DestroyMeetingSysCmdMsg](meetingManagerChannel, envelope, jsonNode)

      // Poll
      case StartCustomPollReqMsg.NAME =>
        routeGenericMsg[StartCustomPollReqMsg](envelope, jsonNode)
      case StartPollReqMsg.NAME =>
        routeGenericMsg[StartPollReqMsg](envelope, jsonNode)
      case StopPollReqMsg.NAME =>
        routeGenericMsg[StopPollReqMsg](envelope, jsonNode)
      case ShowPollResultReqMsg.NAME =>
        routeGenericMsg[ShowPollResultReqMsg](envelope, jsonNode)
      case HidePollResultReqMsg.NAME =>
        routeGenericMsg[HidePollResultReqMsg](envelope, jsonNode)
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

      // Breakout rooms
      case BreakoutRoomsListMsg.NAME =>
        for {
          m <- deserialize[BreakoutRoomsListMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case CreateBreakoutRoomsCmdMsg.NAME =>
        for {
          m <- deserialize[CreateBreakoutRoomsCmdMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case RequestBreakoutJoinURLReqMsg.NAME =>
        for {
          m <- deserialize[RequestBreakoutJoinURLReqMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case BreakoutRoomCreatedMsg.NAME =>
        for {
          m <- deserialize[BreakoutRoomCreatedMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case BreakoutRoomUsersUpdateMsg.NAME =>
        for {
          m <- deserialize[BreakoutRoomUsersUpdateMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case SendBreakoutUsersUpdateMsg.NAME =>
        for {
          m <- deserialize[SendBreakoutUsersUpdateMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case EndAllBreakoutRoomsMsg.NAME =>
        for {
          m <- deserialize[EndAllBreakoutRoomsMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case BreakoutRoomEndedMsg.NAME =>
        for {
          m <- deserialize[BreakoutRoomEndedMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }
      case TransferUserToMeetingRequestMsg.NAME =>
        for {
          m <- deserialize[TransferUserToMeetingRequestMsg](jsonNode)
        } yield {
          send(m.header.meetingId, envelope, m)
        }

      // Layout
      case GetCurrentLayoutReqMsg.NAME =>
        routeGenericMsg[GetCurrentLayoutReqMsg](envelope, jsonNode)
      case LockLayoutMsg.NAME =>
        routeGenericMsg[LockLayoutMsg](envelope, jsonNode)
      case BroadcastLayoutMsg.NAME =>
        routeGenericMsg[BroadcastLayoutMsg](envelope, jsonNode)

      case UserLeaveReqMsg.NAME =>
        routeGenericMsg[UserLeaveReqMsg](envelope, jsonNode)
      case ChangeUserEmojiCmdMsg.NAME =>
        routeGenericMsg[ChangeUserEmojiCmdMsg](envelope, jsonNode)

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
      case MeetingActivityResponseCmdMsg.NAME =>
        routeGenericMsg[MeetingActivityResponseCmdMsg](envelope, jsonNode)
      case LogoutAndEndMeetingCmdMsg.NAME =>
        routeGenericMsg[LogoutAndEndMeetingCmdMsg](envelope, jsonNode)
      case SetRecordingStatusCmdMsg.NAME =>
        routeGenericMsg[SetRecordingStatusCmdMsg](envelope, jsonNode)
      case GetRecordingStatusReqMsg.NAME =>
        routeGenericMsg[GetRecordingStatusReqMsg](envelope, jsonNode)

      // Lock settings
      case LockUserInMeetingCmdMsg.NAME =>
        routeGenericMsg[LockUserInMeetingCmdMsg](envelope, jsonNode)
      case IsMeetingLockedReqMsg.NAME =>
        routeGenericMsg[IsMeetingLockedReqMsg](envelope, jsonNode)
      case ChangeLockSettingsInMeetingCmdMsg.NAME =>
        routeGenericMsg[ChangeLockSettingsInMeetingCmdMsg](envelope, jsonNode)

      // Deskshare
      case DeskshareRtmpBroadcastStartedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[DeskshareRtmpBroadcastStartedVoiceConfEvtMsg](envelope, jsonNode)
      case DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg](envelope, jsonNode)
      case DeskshareStartedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[DeskshareStartedVoiceConfEvtMsg](envelope, jsonNode)
      case DeskshareStoppedVoiceConfEvtMsg.NAME =>
        routeVoiceMsg[DeskshareStoppedVoiceConfEvtMsg](envelope, jsonNode)

      case _ =>
        log.error("Cannot route envelope name " + envelope.name)
      // do nothing
    }
  }

}
