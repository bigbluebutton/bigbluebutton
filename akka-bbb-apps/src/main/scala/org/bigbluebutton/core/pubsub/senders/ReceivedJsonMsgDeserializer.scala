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
    JsonDeserializer.toBbbCommonMsg[CreateMeetingReqMsg](jsonNode) match {
      case Success(msg) => Some(msg.asInstanceOf[CreateMeetingReqMsg])
      case Failure(ex) =>
        log.error("Failed to CreateMeetingReqMsg message " + ex)
        None
    }
  }

  def routeValidateAuthTokenReqMsg(jsonNode: JsonNode): Option[ValidateAuthTokenReqMsg] = {
    JsonDeserializer.toBbbCommonMsg[ValidateAuthTokenReqMsg](jsonNode) match {
      case Success(msg) => Some(msg.asInstanceOf[ValidateAuthTokenReqMsg])
      case Failure(ex) =>
        log.error("Failed to ValidateAuthTokenReqMsg message " + ex)
        None
    }
  }

  def routeRegisterUserReqMsg(jsonNode: JsonNode): Option[RegisterUserReqMsg] = {
    JsonDeserializer.toBbbCommonMsg[RegisterUserReqMsg](jsonNode) match {
      case Success(msg) =>
        // Route via meeting manager as there is a race condition if we send directly to meeting
        // because the meeting actor might not have been created yet.
        Some(msg.asInstanceOf[RegisterUserReqMsg])
      case Failure(ex) =>
        log.error("Failed to RegisterUserReqMsg message " + ex)
        None
    }
  }
}
