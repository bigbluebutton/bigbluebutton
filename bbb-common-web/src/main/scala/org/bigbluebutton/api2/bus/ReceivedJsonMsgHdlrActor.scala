package org.bigbluebutton.api2.bus

import org.bigbluebutton.api2.SystemConfiguration
import org.bigbluebutton.common2.bus._
import org.bigbluebutton.common2.msgs._
import com.fasterxml.jackson.databind.JsonNode
import org.apache.pekko.actor.Actor
import org.apache.pekko.actor.ActorLogging
import org.apache.pekko.actor.Props

import scala.reflect.runtime.universe._

object ReceivedJsonMsgHdlrActor {
  def props(msgFromAkkaAppsEventBus: MsgFromAkkaAppsEventBus): Props =
    Props(classOf[ReceivedJsonMsgHdlrActor], msgFromAkkaAppsEventBus)
}

class ReceivedJsonMsgHdlrActor(val msgFromAkkaAppsEventBus: MsgFromAkkaAppsEventBus)
  extends Actor
  with ActorLogging
  with SystemConfiguration
  with ReceivedMessageRouter {

  object JsonDeserializer extends Deserializer

  def deserialize[B <: BbbCoreMsg](jsonNode: JsonNode)(implicit tag: TypeTag[B]): Option[B] = {
    val (result, error) = JsonDeserializer.toBbbCommonMsg[B](jsonNode)

    result match {
      case Some(msg) =>
        Some(msg.asInstanceOf[B])
      case None =>
        log.error("Failed to deserialize message " + error)
        None
    }
  }

  def route[T <: BbbCoreMsg](envelope: BbbCoreEnvelope, jsonNode: JsonNode)(implicit tag: TypeTag[T]): Unit = {
    for {
      m <- deserialize[T](jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def receive = {
    case msg: JsonMsgFromAkkaApps => handleReceivedJsonMessage(msg)

    case _                        => // do nothing
  }

  def handleReceivedJsonMessage(msg: JsonMsgFromAkkaApps): Unit = {
    for {
      envJsonNode <- JsonDeserializer.toBbbCommonEnvJsNodeMsg(msg.data)
    } yield handle(envJsonNode.envelope, envJsonNode.core)
  }

  def handle(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    //log.debug("*************** Route envelope name " + envelope.name)
    envelope.name match {
      case MeetingCreatedEvtMsg.NAME =>
        route[MeetingCreatedEvtMsg](envelope, jsonNode)
      case MeetingEndedEvtMsg.NAME =>
        route[MeetingEndedEvtMsg](envelope, jsonNode)
      case MeetingDestroyedEvtMsg.NAME =>
        route[MeetingDestroyedEvtMsg](envelope, jsonNode)
      case CheckAlivePongSysMsg.NAME =>
        route[CheckAlivePongSysMsg](envelope, jsonNode)
      case PresenterUnassignedEvtMsg.NAME =>
        route[PresenterUnassignedEvtMsg](envelope, jsonNode)
      case PresenterAssignedEvtMsg.NAME =>
        route[PresenterAssignedEvtMsg](envelope, jsonNode)
      case UserJoinedMeetingEvtMsg.NAME =>
        route[UserJoinedMeetingEvtMsg](envelope, jsonNode)
      case UserLeftMeetingEvtMsg.NAME =>
        route[UserLeftMeetingEvtMsg](envelope, jsonNode)
      case UserJoinedVoiceConfToClientEvtMsg.NAME =>
        route[UserJoinedVoiceConfToClientEvtMsg](envelope, jsonNode)
      case UserLeftVoiceConfToClientEvtMsg.NAME =>
        route[UserLeftVoiceConfToClientEvtMsg](envelope, jsonNode)
      case UserBroadcastCamStartedEvtMsg.NAME =>
        route[UserBroadcastCamStartedEvtMsg](envelope, jsonNode)
      case UserBroadcastCamStoppedEvtMsg.NAME =>
        route[UserBroadcastCamStoppedEvtMsg](envelope, jsonNode)
      case UserRoleChangedEvtMsg.NAME =>
        route[UserRoleChangedEvtMsg](envelope, jsonNode)
      case UserLockedInMeetingEvtMsg.NAME =>
        route[UserLockedInMeetingEvtMsg](envelope, jsonNode)
      case UserSpeechLocaleChangedEvtMsg.NAME =>
        route[UserSpeechLocaleChangedEvtMsg](envelope, jsonNode)
      case CreateBreakoutRoomSysCmdMsg.NAME =>
        route[CreateBreakoutRoomSysCmdMsg](envelope, jsonNode)
      case PresentationUploadTokenSysPubMsg.NAME =>
        route[PresentationUploadTokenSysPubMsg](envelope, jsonNode)
      case GuestsWaitingApprovedEvtMsg.NAME =>
        route[GuestsWaitingApprovedEvtMsg](envelope, jsonNode)
      case PosInWaitingQueueUpdatedRespMsg.NAME =>
        route[PosInWaitingQueueUpdatedRespMsg](envelope, jsonNode)
      case GuestPolicyChangedEvtMsg.NAME =>
        route[GuestPolicyChangedEvtMsg](envelope, jsonNode)
      case LockSettingsInMeetingChangedEvtMsg.NAME =>
        route[LockSettingsInMeetingChangedEvtMsg](envelope, jsonNode)
      case WebcamsOnlyForModeratorChangedEvtMsg.NAME =>
        route[WebcamsOnlyForModeratorChangedEvtMsg](envelope, jsonNode)
      case GuestLobbyMessageChangedEvtMsg.NAME =>
        route[GuestLobbyMessageChangedEvtMsg](envelope, jsonNode)
      case PrivateGuestLobbyMsgChangedEvtMsg.NAME =>
        route[PrivateGuestLobbyMsgChangedEvtMsg](envelope, jsonNode)
      case RecordingChapterBreakSysMsg.NAME =>
        route[RecordingChapterBreakSysMsg](envelope, jsonNode)
      case SetPresentationDownloadableEvtMsg.NAME =>
        route[SetPresentationDownloadableEvtMsg](envelope, jsonNode)
      case RecordingStatusChangedEvtMsg.NAME =>
        route[RecordingStatusChangedEvtMsg](envelope, jsonNode)
      case LearningDashboardEvtMsg.NAME =>
        route[LearningDashboardEvtMsg](envelope, jsonNode)

      case _ =>
      //log.debug("************ Cannot route envelope name " + envelope.name)
      // do nothing
    }
  }
}
