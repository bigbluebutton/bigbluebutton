package org.bigbluebutton.api2.bus

import org.bigbluebutton.api2.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import com.fasterxml.jackson.databind.JsonNode
import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.Props

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


    case _ => // do nothing
  }

  def handleReceivedJsonMessage(msg: JsonMsgFromAkkaApps): Unit = {
    for {
      envJsonNode <- JsonDeserializer.toBbbCommonEnvJsNodeMsg(msg.data)
    } yield handle(envJsonNode.envelope, envJsonNode.core)
  }

  def handle(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    log.debug("*************** Route envelope name " + envelope.name)
    envelope.name match {
      case MeetingCreatedEvtMsg.NAME =>
        log.debug("**************** Route MeetingCreatedEvtMsg")
        route[MeetingCreatedEvtMsg](envelope, jsonNode)
      case MeetingEndedEvtMsg.NAME =>
        route[MeetingEndedEvtMsg](envelope, jsonNode)
      case MeetingDestroyedEvtMsg.NAME =>
        route[MeetingDestroyedEvtMsg](envelope, jsonNode)
      case PubSubPongSysRespMsg.NAME =>
        route[PubSubPongSysRespMsg](envelope, jsonNode)
      case UserEmojiChangedEvtMsg.NAME =>
        route[UserEmojiChangedEvtMsg](envelope, jsonNode)
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
      case CreateBreakoutRoomEvtMsg.NAME =>
        route[CreateBreakoutRoomEvtMsg](envelope, jsonNode)
      case EndBreakoutRoomEvtMsg.NAME =>
        route[EndBreakoutRoomEvtMsg](envelope, jsonNode)


      case _ =>
        log.debug("************ Cannot route envelope name " + envelope.name)
      // do nothing
    }
  }
}

/**
  *         if (message instanceof MeetingStarted) {
          meetingStarted((MeetingStarted) message);
        } else if (message instanceof MeetingDestroyed) {
          meetingDestroyed((MeetingDestroyed) message);
        } else if (message instanceof MeetingEnded) {
          meetingEnded((MeetingEnded) message);
        } else if (message instanceof UserJoined) {
          userJoined((UserJoined) message);
        } else if (message instanceof UserLeft) {
          userLeft((UserLeft) message);
        } else if (message instanceof UserStatusChanged) {
          updatedStatus((UserStatusChanged) message);
        } else if (message instanceof UserRoleChanged) {
          userRoleChanged((UserRoleChanged) message);
        } else if (message instanceof UserJoinedVoice) {
          userJoinedVoice((UserJoinedVoice) message);
        } else if (message instanceof UserLeftVoice) {
          userLeftVoice((UserLeftVoice) message);
        } else if (message instanceof UserListeningOnly) {
          userListeningOnly((UserListeningOnly) message);
        } else if (message instanceof UserSharedWebcam) {
          userSharedWebcam((UserSharedWebcam) message);
        } else if (message instanceof UserUnsharedWebcam) {
          userUnsharedWebcam((UserUnsharedWebcam) message);
        } else if (message instanceof CreateMeeting) {
          processCreateMeeting((CreateMeeting) message);
        } else if (message instanceof EndMeeting) {
          processEndMeeting((EndMeeting) message);
        } else if (message instanceof RegisterUser) {
          processRegisterUser((RegisterUser) message);
        } else if (message instanceof StunTurnInfoRequested) {
          processStunTurnInfoRequested((StunTurnInfoRequested) message);
        } else if (message instanceof CreateBreakoutRoom) {
          processCreateBreakoutRoom((CreateBreakoutRoom) message);
        } else if (message instanceof EndBreakoutRoom) {
          processEndBreakoutRoom((EndBreakoutRoom) message);
        }

  */