package org.bigbluebutton.core.pubsub.senders

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.bus.{ BbbMsgEvent, BbbMsgRouterEventBus, ReceivedJsonMessage }

import scala.util.{ Failure, Success }

trait ReceivedJsonMsgDeserializer extends SystemConfiguration {
  this: ReceivedJsonMsgHandlerActor =>

  object JsonDeserializer extends Deserializer

  def routeCreateMeetingReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[CreateMeetingReqMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[CreateMeetingReqMsg](jsonNode)
      result match {
        case Some(msg) => Some(msg.asInstanceOf[CreateMeetingReqMsg])
        case None =>
          log.error("Failed to deserialize CreateMeetingReqMsg message " + error)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: CreateMeetingReqMsg): Unit = {
      val event = BbbMsgEvent(meetingManagerChannel, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def routeValidateAuthTokenReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[ValidateAuthTokenReqMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[ValidateAuthTokenReqMsg](jsonNode)

      result match {
        case Some(msg) => Some(msg.asInstanceOf[ValidateAuthTokenReqMsg])
        case None =>
          log.error("Failed to deserialize ValidateAuthTokenReqMsg message " + error)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: ValidateAuthTokenReqMsg): Unit = {
      val event = BbbMsgEvent(msg.header.meetingId, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def routeRegisterUserReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[RegisterUserReqMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[RegisterUserReqMsg](jsonNode)

      result match {
        case Some(msg) =>
          Some(msg.asInstanceOf[RegisterUserReqMsg])
        case None =>
          log.error("Failed to RegisterUserReqMsg message " + error)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: RegisterUserReqMsg): Unit = {
      // Route via meeting manager as there is a race condition if we send directly to meeting
      // because the meeting actor might not have been created yet.
      val event = BbbMsgEvent(meetingManagerChannel, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def routeUserBroadcastCamStartMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[UserBroadcastCamStartMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[UserBroadcastCamStartMsg](jsonNode)

      result match {
        case Some(msg) =>
          Some(msg.asInstanceOf[UserBroadcastCamStartMsg])
        case None =>
          log.error("Failed to UserShareWebcamMsg message " + error)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: UserBroadcastCamStartMsg): Unit = {
      val event = BbbMsgEvent(msg.header.meetingId, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def routeUserBroadcastCamStopMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[UserBroadcastCamStopMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[UserBroadcastCamStopMsg](jsonNode)

      result match {
        case Some(msg) =>
          Some(msg.asInstanceOf[UserBroadcastCamStopMsg])
        case None =>
          log.error("Failed to UserShareWebcamMsg message " + error)
          None
      }
    }

    def send(envelope: BbbCoreEnvelope, msg: UserBroadcastCamStopMsg): Unit = {
      val event = BbbMsgEvent(msg.header.meetingId, BbbCommonEnvCoreMsg(envelope, msg))
      publish(event)
    }

    for {
      m <- deserialize(jsonNode)
    } yield {
      send(envelope, m)
    }
  }

  def deserialize[B <: BbbCoreMsg](jsonNode: JsonNode)(implicit tag: Manifest[B]): Option[B] = {
    val (result, error) = JsonDeserializer.toBbbCommonMsg[B](jsonNode)

    result match {
      case Some(msg) =>
        Some(msg.asInstanceOf[B])
      case None =>
        log.error("Failed to deserialize message " + error)
        None
    }
  }

  def send(channel: String, envelope: BbbCoreEnvelope, msg: BbbCoreMsg): Unit = {
    val event = BbbMsgEvent(channel, BbbCommonEnvCoreMsg(envelope, msg))
    publish(event)
  }

  def routeGenericMsg[B <: StandardMsg](envelope: BbbCoreEnvelope, jsonNode: JsonNode)(implicit tag: Manifest[B]): Unit = {
    for {
      m <- deserialize[B](jsonNode)
    } yield {
      send(m.header.meetingId, envelope, m)
    }
  }
}
