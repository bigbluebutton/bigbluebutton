package org.bigbluebutton.core.pubsub.senders

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.bus.{ BbbMsgEvent, BbbMsgRouterEventBus, ReceivedJsonMessage }

import scala.util.{ Failure, Success }

trait ReceivedJsonMsgDeserializer extends SystemConfiguration {
  this: ReceivedJsonMsgHandlerActor =>

  object JsonDeserializer extends Deserializer

  def deserializeCreateMeetingReqMsg(jsonNode: JsonNode): Option[CreateMeetingReqMsg] = {
    val (result, error) = JsonDeserializer.toBbbCommonMsg[CreateMeetingReqMsg](jsonNode)
    result match {
      case Some(msg) => Some(msg.asInstanceOf[CreateMeetingReqMsg])
      case None =>
        log.error("Failed to deserialize CreateMeetingReqMsg message " + error)
        None
    }
  }

  def routeValidateAuthTokenReqMsg(jsonNode: JsonNode): Option[ValidateAuthTokenReqMsg] = {
    val (result, error) = JsonDeserializer.toBbbCommonMsg[ValidateAuthTokenReqMsg](jsonNode)

    result match {
      case Some(msg) => Some(msg.asInstanceOf[ValidateAuthTokenReqMsg])
      case None =>
        log.error("Failed to deserialize ValidateAuthTokenReqMsg message " + error)
        None
    }
  }

  def routeRegisterUserReqMsg(jsonNode: JsonNode): Option[RegisterUserReqMsg] = {
    val (result, error) = JsonDeserializer.toBbbCommonMsg[RegisterUserReqMsg](jsonNode)

    result match {
      case Some(msg) =>
        // Route via meeting manager as there is a race condition if we send directly to meeting
        // because the meeting actor might not have been created yet.
        Some(msg.asInstanceOf[RegisterUserReqMsg])
      case None =>
        log.error("Failed to RegisterUserReqMsg message " + error)
        None
    }
  }
}
